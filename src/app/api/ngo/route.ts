import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { verifyToken } from "../auth/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    if (!["ngo", "admin"].includes(payload.role as string)) return NextResponse.json({ detail: "NGO access only" }, { status: 403 });
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "farmers";

    if (action === "farmers") {
      const district = url.searchParams.get("district") || "";
      let query = `
        SELECT u.id, u.name, u.email, u.phone, u.district, u.status, u.created_at,
          COUNT(DISTINCT m.id) as milk_logs,
          COUNT(DISTINCT c.id) as cattle_count,
          AVG(m.total_yield) as avg_yield,
          MAX(m.date) as last_log_date
        FROM users u
        LEFT JOIN milk_logs m ON m.farmer_id = u.id
        LEFT JOIN cattle c ON c.farmer_id = u.id AND c.status = 'active'
        WHERE u.role = 'farmer'
      `;
      const params: string[] = [];
      if (district) { query += ` AND u.district = $1`; params.push(district); }
      query += ` GROUP BY u.id ORDER BY u.created_at DESC`;
      const result = await pool.query(query, params);
      return NextResponse.json({ farmers: result.rows, total: result.rows.length });
    }

    if (action === "stats") {
      const district = url.searchParams.get("district") || "";
      const whereDistrict = district ? `AND u.district = '${district}'` : "";
      const [totalFarmers, activeFarmers, totalMilk, totalCattle, districts] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM users WHERE role='farmer' ${whereDistrict}`),
        pool.query(`SELECT COUNT(DISTINCT m.farmer_id) FROM milk_logs m JOIN users u ON u.id=m.farmer_id WHERE u.role='farmer' ${whereDistrict} AND m.date >= NOW() - INTERVAL '7 days'`),
        pool.query(`SELECT SUM(m.total_yield) FROM milk_logs m JOIN users u ON u.id=m.farmer_id WHERE u.role='farmer' ${whereDistrict}`),
        pool.query(`SELECT COUNT(*) FROM cattle c JOIN users u ON u.id=c.farmer_id WHERE u.role='farmer' ${whereDistrict} AND c.status='active'`),
        pool.query(`SELECT district, COUNT(*) as count FROM users WHERE role='farmer' AND district IS NOT NULL GROUP BY district ORDER BY count DESC`),
      ]);
      return NextResponse.json({
        total_farmers: parseInt(totalFarmers.rows[0].count),
        active_this_week: parseInt(activeFarmers.rows[0].count),
        total_milk_liters: parseFloat(totalMilk.rows[0].sum || "0").toFixed(1),
        total_cattle: parseInt(totalCattle.rows[0].count),
        districts: districts.rows,
      });
    }

    if (action === "farmer_detail") {
      const farmerId = url.searchParams.get("farmer_id");
      if (!farmerId) return NextResponse.json({ detail: "farmer_id required" }, { status: 400 });
      const [farmer, milkLogs, cattle] = await Promise.all([
        pool.query("SELECT id,name,email,phone,district,status,created_at FROM users WHERE id=$1", [farmerId]),
        pool.query("SELECT * FROM milk_logs WHERE farmer_id=$1 ORDER BY date DESC LIMIT 30", [farmerId]),
        pool.query("SELECT * FROM cattle WHERE farmer_id=$1 AND status='active'", [farmerId]),
      ]);
      if (!farmer.rows[0]) return NextResponse.json({ detail: "Farmer not found" }, { status: 404 });
      const avgYield = milkLogs.rows.length > 0 ? milkLogs.rows.reduce((s: number, l: {total_yield: number}) => s + l.total_yield, 0) / milkLogs.rows.length : 0;
      return NextResponse.json({ farmer: farmer.rows[0], milk_logs: milkLogs.rows, cattle: cattle.rows, summary: { avg_yield: avgYield.toFixed(1), total_logs: milkLogs.rows.length } });
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
    if (!["ngo", "admin"].includes(payload.role as string)) return NextResponse.json({ detail: "NGO access only" }, { status: 403 });
    const { action, farmer_id, note } = await req.json();
    if (action === "visit_report") {
      await pool.query("INSERT INTO audit_logs (id, user_id, action, detail) VALUES (gen_random_uuid(), $1, $2, $3)", [payload.sub, "NGO_VISIT_REPORT", JSON.stringify({ farmer_id, note, agent_id: payload.sub })]);
      return NextResponse.json({ message: "Visit report saved" });
    }
    return NextResponse.json({ detail: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
