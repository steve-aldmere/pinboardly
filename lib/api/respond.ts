import { NextResponse } from "next/server";

/**
 * Standardized JSON response helpers for Next.js Route Handlers
 */

/**
 * Success response with data payload
 * @param data - The data to return
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with { data: <payload> }
 */
export function ok<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/**
 * Bad request error (400)
 * @param message - Error message
 * @param details - Optional error details
 * @returns NextResponse with { error: <message>, details?: <details> }
 */
export function badRequest(
  message: string,
  details?: unknown
): NextResponse {
  const response: { error: string; details?: unknown } = { error: message };
  if (details !== undefined) {
    response.details = details;
  }
  return NextResponse.json(response, { status: 400 });
}

/**
 * Unauthorized error (401)
 * @param message - Error message (default: "Unauthorized")
 * @returns NextResponse with { error: <message> }
 */
export function unauthorized(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Forbidden error (403)
 * @param message - Error message (default: "Forbidden")
 * @returns NextResponse with { error: <message> }
 */
export function forbidden(message: string = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Not found error (404)
 * @param message - Error message (default: "Not found")
 * @returns NextResponse with { error: <message> }
 */
export function notFound(message: string = "Not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Internal server error (500)
 * @param message - Error message (default: "Internal server error")
 * @param details - Optional error details
 * @returns NextResponse with { error: <message>, details?: <details> }
 */
export function serverError(
  message: string = "Internal server error",
  details?: unknown
): NextResponse {
  const response: { error: string; details?: unknown } = { error: message };
  if (details !== undefined) {
    response.details = details;
  }
  return NextResponse.json(response, { status: 500 });
}



