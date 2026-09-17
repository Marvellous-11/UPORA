import { NextResponse } from "next/server";

/** Consistent API error responses without leaking internals. */
export function apiError(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status });
}

export function apiValidationError(details: unknown): NextResponse {
  return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
}