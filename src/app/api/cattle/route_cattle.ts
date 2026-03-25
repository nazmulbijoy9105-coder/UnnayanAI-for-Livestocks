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
    const { cow_id, breed, age_months, weight_kg } = await req.json();
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO cattle (id,farmer_id,cow_id,breed,age_months,weight_kg) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, payload.sub, cow_id, breed, age_months, weight_kg]
    );
    return NextResponse.json({ id, message: "Cattle registered successfully" });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    const result = await pool.query("SELECT * FROM cattle WHERE farmer_id=$1 AND status='active' ORDER BY created_at DESC", [payload.sub]);
    return NextResponse.json({ cattle: result.rows, count: result.rows.length });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
