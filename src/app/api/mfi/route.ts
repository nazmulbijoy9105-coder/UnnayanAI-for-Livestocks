import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import crypto from "crypto";
import { verifyToken } from "../auth/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureLoanTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS loan_applications (
      id VARCHAR(36) PRIMARY KEY,
      farmer_id VARCHAR(36) NOT NULL,
      mfi_officer_id VARCHAR(36),
      amount_requested FLOAT NOT NULL,
      amount_approved FLOAT,
      credit_score INTEGER,
      credit_grade VARCHAR(5),
      risk_level VARCHAR(20),
      status VARCHAR(30) DEFAULT 'pending',
      review_notes TEXT,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    if (!["mfi", "admin"].includes(payload.role as string)) return NextResponse.json({ detail: "MFI access only" }, { status: 403 });
    await ensureLoanTable();
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "applications";

    if (action === "applications") {
      const status = url.searchParams.get("status") || "";
      let query = `
        SELECT l.*, u.name as farmer_name, u.phone as farmer_phone, u.district as farmer_district
        FROM loan_applications l
        JOIN users u ON u.id = l.farmer_id
      `;
      if (status) query += ` WHERE l.status = '${status}'`;
      query += ` ORDER BY l.created_at DESC`;
      const result = await pool.query(query);
      return NextResponse.json({ applications: result.rows, total: result.rows.length });
    }

    if (action === "stats") {
      const [total, pending, approved, rejected, totalAmount] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM loan_applications"),
        pool.query("SELECT COUNT(*) FROM loan_applications WHERE status='pending'"),
        pool.query("SELECT COUNT(*) FROM loan_applications WHERE status='approved'"),
        pool.query("SELECT COUNT(*) FROM loan_applications WHERE status='rejected'"),
        pool.query("SELECT SUM(amount_approved) FROM loan_applications WHERE status='approved'"),
      ]);
      return NextResponse.json({
        total: parseInt(total.rows[0].count),
        pending: parseInt(pending.rows[0].count),
        approved: parseInt(approved.rows[0].count),
        rejected: parseInt(rejected.rows[0].count),
        total_disbursed: parseFloat(totalAmount.rows[0].sum || "0"),
      });
    }

    if (action === "farmers") {
      const result = await pool.query(`
        SELECT u.id, u.name, u.phone, u.district, u.created_at,
          COUNT(DISTINCT m.id) as milk_logs,
          COUNT(DISTINCT c.id) as cattle_count,
          AVG(m.total_yield) as avg_yield,
          COUNT(DISTINCT l.id) as loan_applications
        FROM users u
        LEFT JOIN milk_logs m ON m.farmer_id = u.id
        LEFT JOIN cattle c ON c.farmer_id = u.id AND c.status='active'
        LEFT JOIN loan_applications l ON l.farmer_id = u.id
        WHERE u.role = 'farmer'
        GROUP BY u.id ORDER BY avg_yield DESC NULLS LAST
      `);
      return NextResponse.json({ farmers: result.rows });
    }

    return NextResponse.json({ detail: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    await ensureLoanTable();
    const body = await req.json();
    const { action } = body;

    if (action === "apply" && payload.role === "farmer") {
      const { amount_requested } = body;
      const creditRes = await pool.query(`
        SELECT COUNT(m.id) as logs, AVG(m.total_yield) as avg_yield, COUNT(c.id) as cattle
        FROM users u
        LEFT JOIN milk_logs m ON m.farmer_id = u.id
        LEFT JOIN cattle c ON c.farmer_id = u.id AND c.status='active'
        WHERE u.id = $1 GROUP BY u.id
      `, [payload.sub]);
      const data = creditRes.rows[0];
      const avgYield = parseFloat(data?.avg_yield || "0");
      const logs = parseInt(data?.logs || "0");
      const cattle = parseInt(data?.cattle || "0");
      const score = Math.min(100, Math.round((avgYield / 12) * 30 + Math.min(logs / 30, 1) * 20 + Math.min(cattle * 20, 20) + 15 + 15));
      const grade = score >= 80 ? "A+" : score >= 70 ? "A" : score >= 60 ? "B+" : score >= 50 ? "B" : score >= 40 ? "C" : "D";
      const risk = score >= 70 ? "LOW" : score >= 50 ? "MEDIUM" : "HIGH";
      const id = crypto.randomUUID();
      await pool.query(`INSERT INTO loan_applications (id,farmer_id,amount_requested,credit_score,credit_grade,risk_level,status) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, payload.sub, amount_requested, score, grade, risk, risk === "HIGH" ? "human_review" : "pending"]);
      await pool.query("INSERT INTO audit_logs (id,user_id,action,detail) VALUES (gen_random_uuid(),$1,$2,$3)", [payload.sub, "LOAN_APPLICATION", JSON.stringify({ amount: amount_requested, score, grade, risk })]);
      return NextResponse.json({ id, credit_score: score, grade, risk, status: risk === "HIGH" ? "human_review" : "pending", message: risk === "HIGH" ? "Application requires human review due to high risk" : "Application submitted successfully" });
    }

    if (action === "review" && ["mfi", "admin"].includes(payload.role as string)) {
      const { application_id, decision, amount_approved, notes } = body;
      const status = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "human_review";
      await pool.query(`UPDATE loan_applications SET status=$1, amount_approved=$2, review_notes=$3, mfi_officer_id=$4, reviewed_at=NOW() WHERE id=$5`,
        [status, amount_approved || null, notes || null, payload.sub, application_id]);
      await pool.query("INSERT INTO audit_logs (id,user_id,action,detail) VALUES (gen_random_uuid(),$1,$2,$3)", [payload.sub, `LOAN_${status.toUpperCase()}`, JSON.stringify({ application_id, amount_approved, notes })]);
      return NextResponse.json({ message: `Application ${status}`, status });
    }

    return NextResponse.json({ detail: "Unknown action or unauthorized" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
