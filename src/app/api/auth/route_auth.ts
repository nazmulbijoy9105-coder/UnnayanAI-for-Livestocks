import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import crypto from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const JWT_SECRET = process.env.JWT_SECRET || "unnayan-ai-secret-2026";

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

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function makeToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("hex");
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const [header, body, sig] = parts;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("hex");
  if (sig !== expected) throw new Error("Invalid signature");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp < Date.now() / 1000) throw new Error("Token expired");
  return payload;
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  try {
    await ensureTables();
    const body = await req.json();
    if (action === "signup") {
      const { name, email, password, role, phone, organization, district } = body;
      const validRoles = ["farmer", "ngo", "mfi", "investor", "admin"];
      if (!validRoles.includes(role)) return NextResponse.json({ detail: "Invalid role" }, { status: 400 });
      const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) return NextResponse.json({ detail: "Email already registered" }, { status: 400 });
      const id = crypto.randomUUID();
      const status = role === "ngo" ? "pending" : "active";
      await pool.query(
        `INSERT INTO users (id,name,email,password_hash,role,phone,organization,district,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [id, name, email, hashPassword(password), role, phone||null, organization||null, district||null, status]
      );
      await pool.query(
        "INSERT INTO audit_logs (id,user_id,action,detail) VALUES ($1,$2,$3,$4)",
        [crypto.randomUUID(), id, "USER_SIGNUP", `New ${role}: ${email}`]
      );
      const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
      const token = makeToken({ sub: id, email, role, exp });
      return NextResponse.json({ token, user: { id, name, email, role, phone, organization, district, status }, message: `Welcome to UnnayanAI, ${name}!` });
    }
    if (action === "login") {
      const { email, password } = body;
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (result.rows.length === 0) return NextResponse.json({ detail: "Invalid email or password" }, { status: 401 });
      const user = result.rows[0];
      if (user.password_hash !== hashPassword(password)) return NextResponse.json({ detail: "Invalid email or password" }, { status: 401 });
      await pool.query(
        "INSERT INTO audit_logs (id,user_id,action,detail) VALUES ($1,$2,$3,$4)",
        [crypto.randomUUID(), user.id, "USER_LOGIN", `${user.role} login: ${email}`]
      );
      const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
      const token = makeToken({ sub: user.id, email, role: user.role, exp });
      return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, organization: user.organization, district: user.district, status: user.status }, message: `Welcome back, ${user.name}!` });
    }
    return NextResponse.json({ detail: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    await ensureTables();
    if (action === "me") {
      const result = await pool.query("SELECT id,name,email,role,phone,organization,district,status FROM users WHERE email=$1", [payload.email]);
      if (result.rows.length === 0) return NextResponse.json({ detail: "User not found" }, { status: 404 });
      return NextResponse.json(result.rows[0]);
    }
    if (action === "users") {
      if (payload.role !== "admin") return NextResponse.json({ detail: "Admin only" }, { status: 403 });
      const result = await pool.query("SELECT id,name,email,role,phone,organization,district,status,created_at FROM users ORDER BY created_at DESC");
      return NextResponse.json(result.rows);
    }
    if (action === "stats") {
      if (payload.role !== "admin") return NextResponse.json({ detail: "Admin only" }, { status: 403 });
      const total = await pool.query("SELECT COUNT(*) FROM users");
      const byRole = await pool.query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
      return NextResponse.json({ total_users: parseInt(total.rows[0].count), by_role: Object.fromEntries(byRole.rows.map((r: {role: string, count: string}) => [r.role, parseInt(r.count)])) });
    }
    return NextResponse.json({ detail: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 401 });
  }
}
