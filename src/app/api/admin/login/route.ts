import { NextRequest, NextResponse } from "next/server";

import {
  applyAdminSessionCookie,
  getAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    password?: string;
  };

  const password = body.password?.trim();

  if (!password) {
    return NextResponse.json(
      {
        ok: false,
        error: "Hiányzik a jelszó.",
      },
      { status: 400 },
    );
  }

  if (password !== getAdminPassword()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Hibás jelszó.",
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    ok: true,
  });

  return applyAdminSessionCookie(response);
}

