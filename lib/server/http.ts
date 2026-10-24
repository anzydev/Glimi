import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    details === undefined ? { error: message } : { error: message, details },
    { status }
  );
}

export function unauthorized() {
  return jsonError("Sign in is required.", 401);
}

export function forbidden() {
  return jsonError("You are not allowed to perform this action.", 403);
}

export function notFound(message = "Not found.") {
  return jsonError(message, 404);
}

export function conflict(message: string) {
  return jsonError(message, 409);
}

export function invalidRequest(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(
      "Invalid request.",
      400,
      error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }))
    );
  }

  return jsonError("Invalid request.", 400);
}

export function serverError(context: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : "Unknown error";
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? ` (${error.code})`
      : "";
  console.error(`${context}: ${message}${code}`);
  return jsonError("Something went wrong. Please try again.", 500);
}

export function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests. Please wait and try again." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, retryAfterSeconds)) },
    }
  );
}
