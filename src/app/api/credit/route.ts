import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { verifyToken } from "../auth/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  try {
    const payload = verifyToken(authHeader.replace("Bearer ", ""));
    const url = new URL(req.url);
    const farmerId = url.searchParams.get("farmer_id") || payload.sub as string;
    const logs = await pool.query("SELECT total_yield FROM milk_logs WHERE farmer_id=$1 ORDER BY date DESC LIMIT 30", [farmerId]);
    const cattle = await pool.query("SELECT COUNT(*) as count FROM cattle WHERE farmer_id=$1 AND status='active'", [farmerId]);
    const cattleCount = parseInt(cattle.rows[0].count);
    const milkData = logs.rows;
    if (milkData.length === 0) {
      return NextResponse.json({ farmer_id: farmerId, score: 0, grade: "N/A", risk: "Unknown", explanation_en: "No milk data yet. Start logging daily milk yield.", explanation_bn: "এখনো কোন দুধের তথ্য নেই। প্রতিদিন দুধ লগ করুন।" });
    }
    const avgYield = milkData.reduce((s: number, l: {total_yield: number}) => s + l.total_yield, 0) / milkData.length;
    const consistency = Math.min(100, (milkData.length / 30) * 100);
    const yieldScore = Math.min(100, (avgYield / 20) * 100);
    const cattleScore = Math.min(100, cattleCount * 20);
    const score = Math.round(yieldScore * 0.4 + consistency * 0.3 + cattleScore * 0.3);
    const grade = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";
    const risk = score >= 70 ? "Low" : score >= 50 ? "Medium" : "High";
    return NextResponse.json({
      farmer_id: farmerId, score, grade, risk,
      factors: { milk_yield_score: Math.round(yieldScore), consistency_score: Math.round(consistency), cattle_score: Math.round(cattleScore) },
      explanation_en: `Credit Score: ${score} (Grade ${grade}). Avg daily yield: ${avgYield.toFixed(1)}L over ${milkData.length} days. ${cattleCount} cattle registered.`,
      explanation_bn: `ক্রেডিট স্কোর: ${score} (শ্রেণী ${grade})। গড় দৈনিক: ${avgYield.toFixed(1)}লিটার ${milkData.length} দিনে। ${cattleCount}টি গরু।`
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
