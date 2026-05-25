import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Create the connection pool
const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL
});

// Use the driver adapter
const adapter = new PrismaPg(pool);

// Pass adapter to PrismaClient
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
		
	}),

	baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  emailAndPassword:{
    enabled:true,
	autoSignIn:true
  },
  
  
});