import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/lib/db/init";
import { RegisterSchema } from "@/validations/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();


    // 1. Validate input using Zod schema
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, name, password } = validation.data;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { status: false, message: "A user with this email already exists" },
        { status: 400 },
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user in database
    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
      emailVerified: null,
    });

    return NextResponse.json(
      {
        status: true,
        message: "User registered successfully",
        userId: newUser.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
