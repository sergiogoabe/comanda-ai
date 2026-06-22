import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryify`SELECT 1`;
    
    // Check environment variables
    const hasDatabase = !!process.env.DATABASE_URL;
    const hasAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasMercadoPago = !!process.env.MERCADO_PAGO_ACCESS_TOKEN;

    const services = {
      database: hasDatabase ? "connected" : "missing",
      auth: hasAuthSecret ? "configured" : "missing",
      openai: hasOpenAI ? "configured" : "not configured",
      mercadopago: hasMercadoPago ? "configured" : "not configured",
    };

    const allHealthy = hasDatabase && hasAuthSecret;

    return NextResponse.json({
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services,
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
    }, { 
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
