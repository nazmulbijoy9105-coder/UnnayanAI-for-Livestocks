import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      password_hash VARCHAR(200) NOT NULL,
      role VARCHAR(50) NOT NULL,
      phone VARCHAR(50),
      organization VARCHAR(200),
      district VARCHAR(100),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS milk_logs (
      id VARCHAR(36) PRIMARY KEY,
      farmer_id VARCHAR(36) NOT NULL,
      cow_id VARCHAR(100),
      date DATE NOT NULL,
      morning_yield FLOAT DEFAULT 0,
      evening_yield FLOAT DEFAULT 0,
      total_yield FLOAT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS cattle (
      id VARCHAR(36) PRIMARY KEY,
      farmer_id VARCHAR(36) NOT NULL,
      cow_id VARCHAR(100),
      breed VARCHAR(100),
      age_months INTEGER,
      weight_kg FLOAT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      action VARCHAR(200) NOT NULL,
      detail TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function GET() {
  try {
    await pool.query("SELECT 1");
    await ensureTables();
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
