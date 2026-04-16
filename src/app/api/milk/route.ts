import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { verifyToken } from "../auth/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function runRuleEngine(farmerId: string, cowId: string, date: string, morning: number, evening: number) {
  const violations: string[] = [];
  const warnings: string[] = [];
  let action = "APPROVE";
  const total = morning + evening;

  // Rule 1: Biological plausibility
  if (total > 50) { violations.push("Total yield exceeds 50L — biologically implausible for one cow"); action = "BLOCK"; }
  if (total < 0) { violations.push("Negative yield not allowed"); action = "BLOCK"; }
  if (morning < 0 || evening < 0) { violations.push("Individual session yield cannot be negative"); action = "BLOCK"; }

  // Rule 2: Future date check
  if (new Date(date) > new Date()) { violations.push("Cannot log milk for future dates"); action = "BLOCK"; }

  // Rule 3: Duplicate check
  const dup = await pool.query("SELECT id FROM milk_logs WHERE farmer_id=$1 AND cow_id=$2 AND date=$3", [farmerId, cowId, date]);
  if (dup.rows.length > 0) { violations.push(`Milk log for ${cowId} on ${date} already exists`); action = "BLOCK"; }

  if (action === "BLOCK") return { action, violations, warnings };

  // Rule 4: Anomaly detection
  const history = await pool.query("SELECT AVG(total_yield) as avg, STDDEV(total_yield) as std, COUNT(*) as cnt FROM milk_logs WHERE farmer_id=$1 AND cow_id=$2", [farmerId, cowId]);
  const avg = parseFloat(history.rows[0]?.avg || "0");
  const std = parseFloat(history.rows[0]?.std || "0");
  const cnt = parseInt(history.rows[0]?.cnt || "0");

  if (cnt >= 5 && avg > 0) {
    const dropPct = Math.round((1 - total / avg) * 100);
    const spikePct = Math.round((total / avg - 1) * 100);
    if (total < avg - 2 * std && dropPct > 30) { warnings.push(`${dropPct}% drop from average (${avg.toFixed(1)}L) — possible health issue. Recommend vet check.`); action = "WARN"; }
    if (total > avg + 2 * std && spikePct > 50) { warnings.push(`${spikePct}% spike above average — please verify data accuracy.`); action = "WARN"; }
  }

  // Log audit
  await pool.query("INSERT INTO audit_logs (id, user_id, action, detail) VALUES (gen_random_uuid(), $1, $2, $3)", [farmerId, `RULE_${action}`, JSON.stringify({ cow_id: cowId, date, total, violations, warnings })]);

  return { action, violations, warnings };
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    const { cow_id, date, morning_yield, evening_yield } = await req.json();
    const morning = parseFloat(morning_yield) || 0;
    const evening = parseFloat(evening_yield) || 0;
    const total = morning + evening;

    // Run rule engine first
    const rules = await runRuleEngine(payload.sub as string, cow_id, date, morning, evening);
    if (rules.action === "BLOCK") {
      return NextResponse.json({ detail: rules.violations[0], violations: rules.violations, rule_action: "BLOCKED" }, { status: 400 });
    }

    // Save to DB
    const result = await pool.query(
      "INSERT INTO milk_logs (id, farmer_id, cow_id, date, morning_yield, evening_yield, total_yield) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING id",
      [payload.sub, cow_id, date, morning, evening, total]
    );

    return NextResponse.json({
      id: result.rows[0].id,
      message: "Milk log saved",
      total_yield: total,
      rule_action: rules.action,
      warnings: rules.warnings,
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    const url = new URL(req.url);
    const farmerId = url.searchParams.get("farmer_id") || payload.sub as string;
    if (payload.role === "farmer" && farmerId !== payload.sub) return NextResponse.json({ detail: "Forbidden" }, { status: 403 });

    const logs = await pool.query("SELECT * FROM milk_logs WHERE farmer_id=$1 ORDER BY date DESC LIMIT 90", [farmerId]);
    const summary = await pool.query("SELECT SUM(total_yield) as total, AVG(total_yield) as avg, COUNT(*) as days, MAX(total_yield) as best_day FROM milk_logs WHERE farmer_id=$1", [farmerId]);
    const recent7 = await pool.query("SELECT AVG(total_yield) as avg FROM milk_logs WHERE farmer_id=$1 AND date >= NOW() - INTERVAL '7 days'", [farmerId]);
    const prev7 = await pool.query("SELECT AVG(total_yield) as avg FROM milk_logs WHERE farmer_id=$1 AND date >= NOW() - INTERVAL '14 days' AND date < NOW() - INTERVAL '7 days'", [farmerId]);

    const r7 = parseFloat(recent7.rows[0]?.avg || "0");
    const p7 = parseFloat(prev7.rows[0]?.avg || "0");
    const trend = p7 > 0 ? Math.round(((r7 - p7) / p7) * 100) : 0;

    return NextResponse.json({
      logs: logs.rows,
      summary: { ...summary.rows[0], trend_7day_pct: trend, trend_direction: trend > 0 ? "improving" : trend < 0 ? "declining" : "stable" }
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
