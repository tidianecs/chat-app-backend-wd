import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig(
  process.env.DATABASE_URL
    ? {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "postgresql",
        dbCredentials: { url: process.env.DATABASE_URL },
      }
    : {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: { url: "chat.db" },
      }
);