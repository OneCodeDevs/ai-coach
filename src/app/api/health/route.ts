import { sqlite } from "@/lib/db";

export async function GET() {
  try {
    sqlite.prepare("SELECT 1").get();
    return Response.json({ status: "healthy" });
  } catch {
    return Response.json({ status: "unhealthy" }, { status: 503 });
  }
}
