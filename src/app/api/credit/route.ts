import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { verifyToken } from "../auth/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

interface MilkLog { total_yield: number; date: string; morning_yield: number; evening_yield: number; }
interface Cattle { breed: string; age_months: number; weight_kg: number; }

function calculateProfessionalCreditScore(logs: MilkLog[], cattle: Cattle[], farmer: {district: string; created_at: string}) {
  const now = new Date();
  const daysSinceJoined = Math.floor((now.getTime() - new Date(farmer.created_at).getTime()) / (1000 * 60 * 60 * 24));

  // ── FACTOR 1: Milk Yield Score (30 points) ──
  let milkScore = 0;
  let avgYield = 0;
  let yieldTrend = 0;
  let consistency = 0;
  if (logs.length > 0) {
    avgYield = logs.reduce((s, l) => s + l.total_yield, 0) / logs.length;
    // Benchmark: 10L/day = good for Bangladesh dairy
    milkScore = Math.min(30, Math.round((avgYield / 12) * 30));
    // Trend: compare last 7 vs previous 7
    if (logs.length >= 14) {
      const recent = logs.slice(0, 7).reduce((s, l) => s + l.total_yield, 0) / 7;
      const older = logs.slice(7, 14).reduce((s, l) => s + l.total_yield, 0) / 7;
      yieldTrend = older > 0 ? ((recent - older) / older) * 100 : 0;
    }
    // Consistency: low volatility = higher score
    if (logs.length >= 5) {
      const mean = avgYield;
      const variance = logs.reduce((s, l) => s + Math.pow(l.total_yield - mean, 2), 0) / logs.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
      consistency = Math.max(0, Math.round((1 - cv) * 100));
    }
  }

  // ── FACTOR 2: Data Entry Consistency (20 points) ──
  let dataScore = 0;
  if (logs.length > 0) {
    const coverage = Math.min(logs.length / 30, 1); // 30 days = full score
    const morning_evening_both = logs.filter(l => l.morning_yield > 0 && l.evening_yield > 0).length;
    const completeness = logs.length > 0 ? morning_evening_both / logs.length : 0;
    dataScore = Math.round((coverage * 0.6 + completeness * 0.4) * 20);
  }

  // ── FACTOR 3: Herd Size & Quality (20 points) ──
  let herdScore = 0;
  const premiumBreeds = ["Friesian", "Jersey", "Sahiwal"];
  const premiumCount = cattle.filter(c => premiumBreeds.includes(c.breed)).length;
  const herdSize = cattle.length;
  herdScore = Math.min(20, Math.round((herdSize * 3) + (premiumCount * 2)));

  // ── FACTOR 4: Platform Engagement (15 points) ──
  let engagementScore = 0;
  const logsPerDay = daysSinceJoined > 0 ? logs.length / daysSinceJoined : 0;
  engagementScore = Math.min(15, Math.round(logsPerDay * 15));

  // ── FACTOR 5: Trend & Growth (15 points) ──
  let trendScore = 0;
  if (yieldTrend > 5) trendScore = 15;
  else if (yieldTrend > 0) trendScore = 10;
  else if (yieldTrend > -5) trendScore = 7;
  else trendScore = 3;
  if (logs.length < 14) trendScore = Math.round(trendScore * 0.5); // penalty for insufficient data

  // ── TOTAL SCORE ──
  const totalScore = Math.min(100, milkScore + dataScore + herdScore + engagementScore + trendScore);

  // ── GRADE & RISK ──
  let grade: string, risk: string, loanEligible: string;
  if (totalScore >= 80) { grade = "A+"; risk = "Very Low"; loanEligible = "Up to BDT 100,000"; }
  else if (totalScore >= 70) { grade = "A"; risk = "Low"; loanEligible = "Up to BDT 75,000"; }
  else if (totalScore >= 60) { grade = "B+"; risk = "Low-Medium"; loanEligible = "Up to BDT 50,000"; }
  else if (totalScore >= 50) { grade = "B"; risk = "Medium"; loanEligible = "Up to BDT 30,000"; }
  else if (totalScore >= 40) { grade = "C"; risk = "Medium-High"; loanEligible = "Up to BDT 15,000"; }
  else { grade = "D"; risk = "High"; loanEligible = "Not eligible yet"; }

  // ── RECOMMENDATIONS ──
  const recommendations_en: string[] = [];
  const recommendations_bn: string[] = [];
  if (logs.length < 7) { recommendations_en.push("Log milk daily for 7+ days to improve score"); recommendations_bn.push("স্কোর উন্নয়নে ৭+ দিন প্রতিদিন দুধ লগ করুন"); }
  if (avgYield < 8) { recommendations_en.push("Average yield below 8L/day — consider breed improvement"); recommendations_bn.push("গড় উৎপাদন ৮ লিটারের কম — উন্নত জাত বিবেচনা করুন"); }
  if (consistency < 60) { recommendations_en.push("Inconsistent milk yield detected — check feed and health"); recommendations_bn.push("অসামঞ্জস্যপূর্ণ উৎপাদন — খাদ্য ও স্বাস্থ্য পরীক্ষা করুন"); }
  if (herdSize < 2) { recommendations_en.push("Expand herd to 3+ cattle for better score"); recommendations_bn.push("ভালো স্কোরের জন্য ৩+ গরু রাখুন"); }
  if (yieldTrend < 0) { recommendations_en.push("Declining yield trend — consult field agent"); recommendations_bn.push("উৎপাদন কমছে — ফিল্ড এজেন্টের সাথে যোগাযোগ করুন"); }
  if (recommendations_en.length === 0) { recommendations_en.push("Excellent performance! Keep maintaining consistent logs"); recommendations_bn.push("চমৎকার! ধারাবাহিকভাবে লগ করতে থাকুন"); }

  return {
    score: totalScore,
    grade,
    risk,
    loan_eligible: loanEligible,
    factors: {
      milk_yield: { score: milkScore, max: 30, avg_daily_liters: Math.round(avgYield * 10) / 10, trend_pct: Math.round(yieldTrend * 10) / 10 },
      data_consistency: { score: dataScore, max: 20, days_logged: logs.length, consistency_pct: consistency },
      herd_quality: { score: herdScore, max: 20, herd_size: herdSize, premium_breeds: premiumCount },
      engagement: { score: engagementScore, max: 15, days_on_platform: daysSinceJoined, logs_per_day: Math.round(logsPerDay * 10) / 10 },
      yield_trend: { score: trendScore, max: 15, trend_direction: yieldTrend > 0 ? "improving" : yieldTrend < 0 ? "declining" : "stable" },
    },
    recommendations_en,
    recommendations_bn,
    explanation_en: `Credit Score: ${totalScore}/100 (Grade ${grade}). ${risk} risk profile. Based on ${logs.length} milk logs, ${herdSize} cattle, avg ${avgYield.toFixed(1)}L/day. ${loanEligible}.`,
    explanation_bn: `ক্রেডিট স্কোর: ${totalScore}/১০০ (শ্রেণী ${grade})। ${risk} ঝুঁকি। ${logs.length} দিনের লগ, ${herdSize}টি গরু, গড় ${avgYield.toFixed(1)}লিটার/দিন। ঋণযোগ্যতা: ${loanEligible}।`,
    data_quality: logs.length >= 30 ? "high" : logs.length >= 14 ? "medium" : logs.length >= 7 ? "low" : "insufficient",
    next_review_days: logs.length < 7 ? 7 - logs.length : 30,
  };
}

// ── RULE ENGINE ──
async function runRuleEngine(farmerId: string, milkLog?: {cow_id: string; morning: number; evening: number; date: string}) {
  const violations: string[] = [];
  const warnings: string[] = [];
  let action = "APPROVE";

  if (milkLog) {
    const total = milkLog.morning + milkLog.evening;
    // Rule 1: Biological plausibility
    if (total > 50) { violations.push("YIELD_ANOMALY: Total yield exceeds 50L — biologically implausible"); action = "BLOCK"; }
    if (total < 0) { violations.push("NEGATIVE_YIELD: Negative yield not allowed"); action = "BLOCK"; }
    // Rule 2: Anomaly detection — compare to farmer average
    const history = await pool.query("SELECT AVG(total_yield) as avg FROM milk_logs WHERE farmer_id=$1", [farmerId]);
    const avgYield = parseFloat(history.rows[0]?.avg || "0");
    if (avgYield > 0 && total < avgYield * 0.5) { warnings.push(`YIELD_DROP: ${Math.round((1 - total/avgYield)*100)}% drop from average — possible health issue`); }
    if (avgYield > 0 && total > avgYield * 2) { warnings.push(`YIELD_SPIKE: ${Math.round((total/avgYield - 1)*100)}% spike from average — verify data`); }
    // Rule 3: Duplicate check
    const duplicate = await pool.query("SELECT id FROM milk_logs WHERE farmer_id=$1 AND cow_id=$2 AND date=$3", [farmerId, milkLog.cow_id, milkLog.date]);
    if (duplicate.rows.length > 0) { violations.push("DUPLICATE_ENTRY: Log for this cow on this date already exists"); action = "BLOCK"; }
    // Rule 4: Future date
    if (new Date(milkLog.date) > new Date()) { violations.push("FUTURE_DATE: Cannot log milk for future dates"); action = "BLOCK"; }
    if (warnings.length > 0 && action === "APPROVE") action = "WARN";
  }

  // Log to audit
  if (violations.length > 0 || warnings.length > 0) {
    await pool.query("INSERT INTO audit_logs (id, user_id, action, detail) VALUES (gen_random_uuid(), $1, $2, $3)", [farmerId, `RULE_ENGINE_${action}`, JSON.stringify({ violations, warnings })]);
  }

  return { action, violations, warnings };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    const url = new URL(req.url);
    const farmerId = url.searchParams.get("farmer_id") || payload.sub as string;
    if (payload.role === "farmer" && farmerId !== payload.sub) return NextResponse.json({ detail: "Forbidden" }, { status: 403 });

    const [logsResult, cattleResult, farmerResult] = await Promise.all([
      pool.query("SELECT total_yield, date, morning_yield, evening_yield FROM milk_logs WHERE farmer_id=$1 ORDER BY date DESC LIMIT 90", [farmerId]),
      pool.query("SELECT breed, age_months, weight_kg FROM cattle WHERE farmer_id=$1 AND status='active'", [farmerId]),
      pool.query("SELECT district, created_at FROM users WHERE id=$1", [farmerId]),
    ]);

    if (logsResult.rows.length === 0 && cattleResult.rows.length === 0) {
      return NextResponse.json({ farmer_id: farmerId, score: 0, grade: "N/A", risk: "Unrated", loan_eligible: "No data yet", explanation_en: "No data yet. Register cattle and log milk daily to build your credit score.", explanation_bn: "কোন তথ্য নেই। প্রতিদিন গরু নিবন্ধন ও দুধ লগ করে আপনার ক্রেডিট স্কোর তৈরি করুন।", factors: {}, recommendations_en: ["Register your cattle first", "Log milk every day"], recommendations_bn: ["প্রথমে গরু নিবন্ধন করুন", "প্রতিদিন দুধ লগ করুন"], data_quality: "insufficient" });
    }

    const score = calculateProfessionalCreditScore(logsResult.rows, cattleResult.rows, farmerResult.rows[0] || { district: "", created_at: new Date().toISOString() });
    return NextResponse.json({ farmer_id: farmerId, ...score });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    const body = await req.json();
    const ruleCheck = await runRuleEngine(payload.sub as string, body);
    return NextResponse.json(ruleCheck);
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
