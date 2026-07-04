import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/validations/validators";
import { signIn } from "next-auth/react";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate input using Zod schema
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = body;

    const result = await signIn("credentials", {
      email,
      password,
    });

     console.log(result)


  } catch (e) {
    console.error("Registration error:", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
