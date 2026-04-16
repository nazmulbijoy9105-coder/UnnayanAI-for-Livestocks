import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { verifyToken } from "../auth/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const SMS_API_KEY = process.env.SMS_API_KEY || "";
const SMS_SENDER = process.env.SMS_SENDER || "UnnayanAI";

// SMS Templates in Bangla + English
const SMS_TEMPLATES = {
  yield_drop: {
    bn: (name: string, drop: number, avg: number) => `প্রিয় ${name}, আপনার গরুর দুধ উৎপাদন ${drop}% কমেছে (গড়: ${avg}লি)। পশু চিকিৎসকের সাথে যোগাযোগ করুন। -UnnayanAI`,
    en: (name: string, drop: number, avg: number) => `Dear ${name}, milk yield dropped ${drop}% (avg: ${avg}L). Please consult a vet. -UnnayanAI`,
  },
  credit_improved: {
    bn: (name: string, score: number, grade: string) => `অভিনন্দন ${name}! আপনার ক্রেডিট স্কোর ${score} (${grade} শ্রেণী)। ঋণের জন্য আবেদন করুন। -UnnayanAI`,
    en: (name: string, score: number, grade: string) => `Congratulations ${name}! Credit score: ${score} (Grade ${grade}). You may apply for a loan. -UnnayanAI`,
  },
  loan_approved: {
    bn: (name: string, amount: string) => `সুখবর ${name}! আপনার ${amount} টাকার ঋণ অনুমোদিত হয়েছে। বিস্তারিত জানতে এজেন্টের সাথে যোগাযোগ করুন। -UnnayanAI`,
    en: (name: string, amount: string) => `Good news ${name}! Your loan of BDT ${amount} has been approved. Contact your agent for details. -UnnayanAI`,
  },
  weekly_summary: {
    bn: (name: string, total: number, avg: number, days: number) => `${name}, এই সপ্তাহে ${days} দিন লগ করেছেন। মোট: ${total}লি, গড়: ${avg}লি/দিন। চালিয়ে যান! -UnnayanAI`,
    en: (name: string, total: number, avg: number, days: number) => `${name}, ${days} days logged this week. Total: ${total}L, Avg: ${avg}L/day. Keep it up! -UnnayanAI`,
  },
  reminder: {
    bn: (name: string) => `প্রিয় ${name}, আজকের দুধ লগ করতে ভুলবেন না। UnnayanAI-তে লগইন করুন। -UnnayanAI`,
    en: (name: string) => `Dear ${name}, don't forget to log today's milk yield on UnnayanAI. -UnnayanAI`,
  },
};

async function sendSMS(phone: string, message: string): Promise<{success: boolean; response?: string; error?: string; mock?: boolean}> {
  // Validate Bangladesh phone
  const cleanPhone = phone.replace(/\D/g, "");
  const bdPhone = cleanPhone.startsWith("880") ? cleanPhone : cleanPhone.startsWith("0") ? "880" + cleanPhone.slice(1) : "880" + cleanPhone;

  if (!SMS_API_KEY) {
    // Mock mode — log to DB audit trail
    console.log(`[SMS MOCK] To: ${bdPhone} | Message: ${message}`);
    await pool.query("INSERT INTO audit_logs (id, user_id, action, detail) VALUES (gen_random_uuid(), NULL, $1, $2)", ["SMS_MOCK_SENT", JSON.stringify({ phone: bdPhone, message, timestamp: new Date().toISOString() })]);
    return { success: true, mock: true, response: "Mock SMS logged" };
  }

  try {
    // SSL Wireless Bangladesh (most popular BD SMS gateway)
    const res = await fetch(`https://api.sslwireless.com/api/v3/send-sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_token: SMS_API_KEY, sid: SMS_SENDER, msisdn: bdPhone, sms: message, csms_id: Date.now().toString() }),
    });
    const data = await res.json();
    await pool.query("INSERT INTO audit_logs (id, user_id, action, detail) VALUES (gen_random_uuid(), NULL, $1, $2)", ["SMS_SENT", JSON.stringify({ phone: bdPhone, message: message.slice(0, 50), status: data })]);
    return { success: res.ok, response: JSON.stringify(data) };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

async function checkAndSendYieldAlerts() {
  // Find farmers with 30%+ yield drops in last 2 days vs their 7-day average
  const alerts = await pool.query(`
    SELECT u.id, u.name, u.phone,
      AVG(m7.total_yield) as avg_7day,
      AVG(m2.total_yield) as avg_2day
    FROM users u
    JOIN milk_logs m7 ON m7.farmer_id = u.id AND m7.date >= NOW() - INTERVAL '7 days'
    LEFT JOIN milk_logs m2 ON m2.farmer_id = u.id AND m2.date >= NOW() - INTERVAL '2 days'
    WHERE u.role = 'farmer' AND u.phone IS NOT NULL AND u.phone != ''
    GROUP BY u.id
    HAVING AVG(m7.total_yield) > 0
      AND AVG(m2.total_yield) < AVG(m7.total_yield) * 0.7
  `);

  const results = [];
  for (const farmer of alerts.rows) {
    const drop = Math.round((1 - farmer.avg_2day / farmer.avg_7day) * 100);
    const avg = parseFloat(farmer.avg_7day).toFixed(1);
    const msg = SMS_TEMPLATES.yield_drop.bn(farmer.name, drop, parseFloat(avg));
    const result = await sendSMS(farmer.phone, msg);
    results.push({ farmer: farmer.name, phone: farmer.phone, drop, result });
  }
  return results;
}

async function sendWeeklyReminders() {
  // Find farmers who haven't logged in 2+ days
  const inactive = await pool.query(`
    SELECT u.id, u.name, u.phone
    FROM users u
    WHERE u.role = 'farmer' AND u.phone IS NOT NULL AND u.phone != ''
    AND u.id NOT IN (
      SELECT DISTINCT farmer_id FROM milk_logs
      WHERE date >= NOW() - INTERVAL '2 days'
    )
  `);

  const results = [];
  for (const farmer of inactive.rows) {
    const msg = SMS_TEMPLATES.reminder.bn(farmer.name);
    const result = await sendSMS(farmer.phone, msg);
    results.push({ farmer: farmer.name, result });
  }
  return results;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    if (!["admin", "ngo"].includes(payload.role as string)) return NextResponse.json({ detail: "Admin/NGO only" }, { status: 403 });
    const { action, phone, message, farmer_id, type, lang } = await req.json();

    if (action === "send") {
      if (!phone || !message) return NextResponse.json({ detail: "phone and message required" }, { status: 400 });
      const result = await sendSMS(phone, message);
      return NextResponse.json(result);
    }

    if (action === "send_template") {
      const farmer = await pool.query("SELECT name, phone FROM users WHERE id=$1", [farmer_id]);
      if (!farmer.rows[0]?.phone) return NextResponse.json({ detail: "Farmer has no phone number" }, { status: 400 });
      const { name, phone: farmerPhone } = farmer.rows[0];
      let msg = "";
      const l = lang || "bn";
      if (type === "reminder") msg = SMS_TEMPLATES.reminder[l as "bn"|"en"](name);
      else if (type === "credit_improved") {
        const credit = await fetch(`/api/credit?farmer_id=${farmer_id}`).then(r => r.json()).catch(() => ({ score: 0, grade: "N/A" }));
        msg = SMS_TEMPLATES.credit_improved[l as "bn"|"en"](name, credit.score, credit.grade);
      }
      else return NextResponse.json({ detail: "Unknown template type" }, { status: 400 });
      const result = await sendSMS(farmerPhone, msg);
      return NextResponse.json({ ...result, message: msg });
    }

    if (action === "check_yield_alerts") {
      const results = await checkAndSendYieldAlerts();
      return NextResponse.json({ alerts_sent: results.length, results });
    }

    if (action === "send_reminders") {
      const results = await sendWeeklyReminders();
      return NextResponse.json({ reminders_sent: results.length, results });
    }

    return NextResponse.json({ detail: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    if (!["admin", "ngo"].includes(payload.role as string)) return NextResponse.json({ detail: "Admin/NGO only" }, { status: 403 });
    const logs = await pool.query("SELECT * FROM audit_logs WHERE action LIKE 'SMS%' ORDER BY created_at DESC LIMIT 50");
    return NextResponse.json({ sms_logs: logs.rows, total: logs.rows.length, sms_configured: !!SMS_API_KEY });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
