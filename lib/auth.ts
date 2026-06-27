/**
 * NextAuth Configuration
 * Authentication setup with Google OAuth and Credentials provider
 */

import { DefaultSession, NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { sequelize } from "@/lib/db/sequelize";
import { initializeModels, User } from "@/lib/db/init";
import { LoginSchema } from "@/utils/validators";

const id = process.env.GOOGLE_ID;
const secret = process.env.GOOGLE_SECRET;

if (!id || !secret) {
  throw new Error("Google OAuth credentials missing in environment variables");
}

// Initialize models before using them
initializeModels();

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
    } & DefaultSession["user"];
  }
  
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  // Uncomment adapter if you want to use database sessions (for credentials provider)
  // adapter: SequelizeAdapter(sequelize),
  
  providers: [
    Google({
      clientId: id,
      clientSecret: secret,
    }),
    
    
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          const result = LoginSchema.safeParse(credentials);
          if (!result.success) {
            console.log("Validation failed:", result.error);
            return null;
          }

          const user = await User.findOne({
            where: { email: result.data.email },
          });

          if (!user) {
            console.log("User not found");
            return null;
          }

          let userPassword = user && user.dataValues.password

          const isValidPassword = await bcrypt.compare(
            result.data.password,
            userPassword,
          );

          if (!isValidPassword) {
            console.log("Invalid password");
            return null;
          }

          
          return {
            id: user.dataValues.id,
            email: user.dataValues.email,
            name: user.dataValues.name,
            image: user.dataValues.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    
    async signIn({ user, profile, account }) {
      try {
        // Ensure user exists in database
        const existingUser = await User.findOne({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user for OAuth
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: account?.provider === "google" ? new Date() : null,
          });
        } else if (account?.provider === "google" && !existingUser.emailVerified) {
          // Update email verification status for Google users
          await existingUser.update({ emailVerified: new Date() });
        }
        
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false; // Prevent sign in if database operation fails
      }
    },
  },
  
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  
  session: {
    strategy: "jwt", // Use JWT strategy (not database sessions)
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === "development", // Enable debug in development
  
  // Optional: Add logging
  logger: {
    error(code, metadata) {
      console.error(`NextAuth error [${code}]:`, metadata);
    },
    warn(code) {
      console.warn(`NextAuth warning: ${code}`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log(`NextAuth debug [${code}]:`, metadata);
      }
    },
  },
};