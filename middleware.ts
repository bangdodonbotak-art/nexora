import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware that mocks the NEXORA router's ultra-low-latency contract.
 * Real deployments resolve region from the platform geolocation headers; this
 * surfaces the same shape to clients and downstream functions.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const region =
    request.headers.get("x-nf-geo-country") ??
    request.headers.get("x-country") ??
    request.headers.get("x-vercel-ip-country") ??
    "global";

  response.headers.set("x-nexora-router", "nexora-auto");
  response.headers.set("x-nexora-edge-region", region.toLowerCase());
  response.headers.set("x-nexora-routing-latency", "11.8ms");
  response.headers.set("x-nexora-failover", "strict");
  response.headers.set("x-nexora-trace-id", traceId());

  return response;
}

function traceId() {
  try {
    return `req_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  } catch {
    return `req_${Date.now().toString(36)}`;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|__forms.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|pdf)$).*)",
  ],
};
