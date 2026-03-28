import "server-only";

import { createHash, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE_NAME = "soho_admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const FALLBACK_ADMIN_PASSWORD = "Miskolcisoho1982!admin";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || FALLBACK_ADMIN_PASSWORD;
}

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SHARED_SECRET?.trim() ||
    FALLBACK_ADMIN_PASSWORD
  );
}

export function getAdminSessionToken() {
  return sha256(`${getAdminPassword()}::${getAdminSessionSecret()}`);
}

export function isAdminSessionTokenValid(token: string | undefined) {
  if (!token) {
    return false;
  }

  return safeEqual(token, getAdminSessionToken());
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isAdminSessionTokenValid(cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value);
}

export async function requireAdminPageAuth() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function redirectIfAdminAuthenticated() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }
}

export function ensureAdminApiAuth(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (isAdminSessionTokenValid(token)) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Unauthorized.",
    },
    { status: 401 },
  );
}

export function applyAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, getAdminSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return response;
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

