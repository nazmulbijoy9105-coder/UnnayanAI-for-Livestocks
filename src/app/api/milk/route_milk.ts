import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import crypto from "crypto";
import { verifyToken } from "../auth/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    const { cow_id, date, morning_yield, evening_yield } = await req.json();
    const total = (morning_yield || 0) + (evening_yield || 0);
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO milk_logs (id,farmer_id,cow_id,date,morning_yield,evening_yield,total_yield) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, payload.sub, cow_id, date, morning_yield||0, evening_yield||0, total]
    );
    return NextResponse.json({ id, message: "Milk log saved", total_yield: total });
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
    const result = await pool.query("SELECT * FROM milk_logs WHERE farmer_id=$1 ORDER BY date DESC LIMIT 30", [farmerId]);
    const summary = await pool.query("SELECT SUM(total_yield) as total, AVG(total_yield) as avg, COUNT(*) as days FROM milk_logs WHERE farmer_id=$1", [farmerId]);
    return NextResponse.json({ logs: result.rows, summary: summary.rows[0] });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
