import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET() {
  try {
    await pool.query("SELECT 1");
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const milkLogs = await pool.query("SELECT COUNT(*) FROM milk_logs");
    const cattle = await pool.query("SELECT COUNT(*) FROM cattle");
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      version: "1.0.0",
      platform: "UnnayanAI Smart Dairy & Livestock Platform",
      stats: {
        total_users: parseInt(users.rows[0].count),
        total_milk_logs: parseInt(milkLogs.rows[0].count),
        total_cattle: parseInt(cattle.rows[0].count),
      }
    });
  } catch (e) {
    return NextResponse.json({ status: "unhealthy", database: "disconnected", error: String(e) }, { status: 500 });
  }
}
