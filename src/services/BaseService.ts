import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/models/User";
import { ZodSchema, ZodError } from "zod";

export abstract class BaseService {
  protected async getCurrentUserId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return session?.user?.id ?? null;
  }

  protected async getCurrentUser(): Promise<User | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;
    return User.findByPk(userId);
  }

  protected validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(result.error);
    }
    return result.data;
  }

  protected handleError(error: unknown): never {
    if (error instanceof ValidationError) throw error;
    if (error instanceof Error) throw new ServiceError(error.message);
    throw new ServiceError("An unexpected error occurred");
  }
}

export class ValidationError extends Error {
  constructor(public zodError: ZodError) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}
