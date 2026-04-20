import { NextResponse } from "next/server";

const API_BASE = "https://unnayan-ai-for-livestocks.vercel.app";

const docs = {
  openapi: "3.0.0",
  info: {
    title: "UnnayanAI API",
    version: "1.0.0",
    description: "Smart Dairy AI & IoT Platform API for Bangladesh farmers, NGOs, MFIs and investors",
    contact: { name: "UnnayanAI Support", email: "api@unnayan.ai" },
    license: { name: "MIT" }
  },
  servers: [{ url: API_BASE, description: "Production" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      SignupRequest: { type: "object", required: ["name","email","password","role"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", minLength: 6 }, role: { type: "string", enum: ["farmer","ngo","mfi","investor","admin"] }, phone: { type: "string" }, district: { type: "string" }, organization: { type: "string" } } },
      LoginRequest: { type: "object", required: ["email","password"], properties: { email: { type: "string" }, password: { type: "string" } } },
      AuthResponse: { type: "object", properties: { token: { type: "string" }, user: { type: "object" }, message: { type: "string" } } },
      MilkLog: { type: "object", required: ["cow_id","date"], properties: { cow_id: { type: "string" }, date: { type: "string", format: "date" }, morning_yield: { type: "number" }, evening_yield: { type: "number" } } },
      Cattle: { type: "object", required: ["cow_id","breed"], properties: { cow_id: { type: "string" }, breed: { type: "string" }, age_months: { type: "integer" }, weight_kg: { type: "number" } } },
      CreditScore: { type: "object", properties: { score: { type: "integer", minimum: 0, maximum: 100 }, grade: { type: "string" }, risk: { type: "string" }, loan_eligible: { type: "string" }, explanation_en: { type: "string" }, explanation_bn: { type: "string" }, factors: { type: "object" }, recommendations_en: { type: "array", items: { type: "string" } } } }
    }
  },
  paths: {
    "/api/health": { get: { tags: ["System"], summary: "Health check", description: "Check API and database status", responses: { "200": { description: "System healthy", content: { "application/json": { example: { status: "healthy", database: "connected", version: "1.0.0", stats: { total_users: 9, total_milk_logs: 10, total_cattle: 7 } } } } } } } },
    "/api/auth": {
      post: {
        tags: ["Authentication"],
        summary: "Signup or Login",
        description: "Use ?action=signup for registration or ?action=login for authentication",
        parameters: [{ name: "action", in: "query", required: true, schema: { type: "string", enum: ["signup","login"] } }],
        requestBody: { required: true, content: { "application/json": { schema: { oneOf: [{ "$ref": "#/components/schemas/SignupRequest" }, { "$ref": "#/components/schemas/LoginRequest" }] } } } },
        responses: { "200": { description: "Success", content: { "application/json": { schema: { "$ref": "#/components/schemas/AuthResponse" } } } }, "400": { description: "Validation error" }, "401": { description: "Invalid credentials" } },
        security: []
      },
      get: {
        tags: ["Authentication"],
        summary: "Get user info or list users",
        parameters: [{ name: "action", in: "query", required: true, schema: { type: "string", enum: ["me","users","stats"] } }],
        responses: { "200": { description: "Success" }, "401": { description: "Unauthorized" } }
      }
    },
    "/api/milk": {
      post: { tags: ["Milk Logs"], summary: "Log milk yield", description: "Submit daily milk yield with rule engine validation. Validates against biological plausibility, duplicates, future dates, and detects anomalies.", requestBody: { required: true, content: { "application/json": { schema: { "$ref": "#/components/schemas/MilkLog" } } } }, responses: { "200": { description: "Milk log saved", content: { "application/json": { example: { id: "uuid", message: "Milk log saved", total_yield: 12.5, rule_action: "APPROVE", warnings: [] } } } }, "400": { description: "Rule engine blocked — invalid data" } } },
      get: { tags: ["Milk Logs"], summary: "Get milk logs and summary", parameters: [{ name: "farmer_id", in: "query", schema: { type: "string" }, description: "Filter by farmer (admin/NGO only)" }], responses: { "200": { description: "Milk logs with 7-day trend analysis" } } }
    },
    "/api/cattle": {
      post: { tags: ["Cattle"], summary: "Register cattle", requestBody: { required: true, content: { "application/json": { schema: { "$ref": "#/components/schemas/Cattle" } } } }, responses: { "200": { description: "Cattle registered" } } },
      get: { tags: ["Cattle"], summary: "List cattle", responses: { "200": { description: "Cattle list" } } }
    },
    "/api/credit": {
      get: { tags: ["Credit Scoring"], summary: "Get AI credit score", description: "5-factor professional credit score: milk yield (30pts), data consistency (20pts), herd quality (20pts), platform engagement (15pts), yield trend (15pts). Includes Bangla explanations and loan eligibility.", parameters: [{ name: "farmer_id", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Credit score", content: { "application/json": { schema: { "$ref": "#/components/schemas/CreditScore" } } } } } },
      post: { tags: ["Credit Scoring"], summary: "Run rule engine check", requestBody: { content: { "application/json": { example: { cow_id: "COW-001", morning: 7.5, evening: 5.0, date: "2026-03-20" } } } }, responses: { "200": { description: "Rule engine result" } } }
    },
    "/api/ngo": {
      get: { tags: ["NGO"], summary: "NGO farmer management", parameters: [{ name: "action", in: "query", schema: { type: "string", enum: ["farmers","stats","farmer_detail"] } }, { name: "district", in: "query", schema: { type: "string" } }, { name: "farmer_id", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Farmer data" } } }
    },
    "/api/mfi": {
      get: { tags: ["MFI"], summary: "MFI loan management", parameters: [{ name: "action", in: "query", schema: { type: "string", enum: ["applications","stats","farmers"] } }, { name: "status", in: "query", schema: { type: "string", enum: ["pending","approved","rejected","human_review"] } }], responses: { "200": { description: "Loan data" } } },
      post: { tags: ["MFI"], summary: "Submit or review loan application", requestBody: { content: { "application/json": { examples: { apply: { summary: "Farmer applies for loan", value: { action: "apply", amount_requested: 50000 } }, review: { summary: "MFI reviews application", value: { action: "review", application_id: "uuid", decision: "approve", amount_approved: 45000, notes: "Good track record" } } } } } }, responses: { "200": { description: "Success" } } }
    },
    "/api/sms": {
      post: { tags: ["SMS"], summary: "Send SMS alerts in Bangla", parameters: [], requestBody: { content: { "application/json": { examples: { yield_alert: { summary: "Check and send yield drop alerts", value: { action: "check_yield_alerts" } }, reminder: { summary: "Send reminder to inactive farmers", value: { action: "send_reminders" } }, template: { summary: "Send template SMS to farmer", value: { action: "send_template", farmer_id: "uuid", type: "reminder", lang: "bn" } } } } } }, responses: { "200": { description: "SMS result" } } },
      get: { tags: ["SMS"], summary: "Get SMS audit logs", responses: { "200": { description: "SMS log history" } } }
    },
    "/api/audit": {
      get: { tags: ["Audit"], summary: "Audit trail (admin only)", description: "Immutable hash-chained audit logs for PKSF governance compliance", parameters: [{ name: "action", in: "query", schema: { type: "string", enum: ["logs","stats","verify"] } }, { name: "filter", in: "query", schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "Audit logs" } } }
    }
  },
  tags: [
    { name: "System", description: "Health and status" },
    { name: "Authentication", description: "Signup, login, user management" },
    { name: "Milk Logs", description: "Daily milk yield with rule engine validation" },
    { name: "Cattle", description: "Livestock registration and management" },
    { name: "Credit Scoring", description: "5-factor AI credit scoring with Bangla explanations" },
    { name: "NGO", description: "NGO field agent farmer cluster management" },
    { name: "MFI", description: "Microfinance loan application and review" },
    { name: "SMS", description: "Bangladesh Bangla SMS alerts and notifications" },
    { name: "Audit", description: "Governance audit trail for PKSF compliance" }
  ]
};

export async function GET() {
  return NextResponse.json(docs, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" } });
}
