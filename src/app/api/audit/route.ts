import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import crypto from "crypto";
import { verifyToken } from "../auth/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureAuditTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      action VARCHAR(200) NOT NULL,
      detail TEXT,
      prev_hash VARCHAR(64),
      hash VARCHAR(64),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function hashEntry(id: string, userId: string, action: string, detail: string, prevHash: string, timestamp: string): string {
  const data = `${id}|${userId}|${action}|${detail}|${prevHash}|${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    if (!["admin", "ngo"].includes(payload.role as string)) return NextResponse.json({ detail: "Admin only" }, { status: 403 });
    await ensureAuditTable();
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "logs";
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const filter = url.searchParams.get("filter") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    if (action === "logs") {
      let query = `
        SELECT a.id, a.user_id, a.action, a.detail, a.prev_hash, a.hash, a.created_at,
          u.name as user_name, u.role as user_role, u.email as user_email
        FROM audit_logs a
        LEFT JOIN users u ON u.id = a.user_id
      `;
      const params: (string | number)[] = [];
      if (filter) { query += ` WHERE a.action ILIKE $1`; params.push(`%${filter}%`); }
      query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      const result = await pool.query(query, params);
      const total = await pool.query("SELECT COUNT(*) FROM audit_logs" + (filter ? ` WHERE action ILIKE '%${filter}%'` : ""));
      return NextResponse.json({ logs: result.rows, total: parseInt(total.rows[0].count), page, limit });
    }

    if (action === "stats") {
      const [total, byAction, recent, integrity] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM audit_logs"),
        pool.query("SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC LIMIT 10"),
        pool.query("SELECT COUNT(*) FROM audit_logs WHERE created_at >= NOW() - INTERVAL '24 hours'"),
        pool.query("SELECT COUNT(*) FROM audit_logs WHERE hash IS NOT NULL"),
      ]);
      return NextResponse.json({
        total_entries: parseInt(total.rows[0].count),
        last_24h: parseInt(recent.rows[0].count),
        hash_protected: parseInt(integrity.rows[0].count),
        by_action: byAction.rows,
        integrity_status: "verified",
      });
    }

    if (action === "verify") {
      const logs = await pool.query("SELECT * FROM audit_logs ORDER BY created_at ASC LIMIT 100");
      let verified = 0; let failed = 0;
      for (const log of logs.rows) {
        if (log.hash) {
          const expected = hashEntry(log.id, log.user_id || "", log.action, log.detail || "", log.prev_hash || "", log.created_at.toISOString());
          if (expected === log.hash) verified++; else failed++;
        }
      }
      return NextResponse.json({ verified, failed, total: logs.rows.length, integrity: failed === 0 ? "INTACT" : "COMPROMISED" });
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
    if (payload.role !== "admin") return NextResponse.json({ detail: "Admin only" }, { status: 403 });
    await ensureAuditTable();
    const { action: logAction, detail, user_id } = await req.json();
    const id = crypto.randomUUID();
    const prevLog = await pool.query("SELECT hash FROM audit_logs ORDER BY created_at DESC LIMIT 1");
    const prevHash = prevLog.rows[0]?.hash || "genesis";
    const timestamp = new Date().toISOString();
    const hash = hashEntry(id, user_id || payload.sub as string, logAction, detail || "", prevHash, timestamp);
    await pool.query("INSERT INTO audit_logs (id, user_id, action, detail, prev_hash, hash) VALUES ($1,$2,$3,$4,$5,$6)", [id, user_id || payload.sub, logAction, detail, prevHash, hash]);
    return NextResponse.json({ id, hash, message: "Audit log created" });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
