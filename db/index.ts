import dotenv from "dotenv";
dotenv.config();

import * as schema from "./schema";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePG } from "drizzle-orm/node-postgres";
import Database from "better-sqlite3";
import { Pool } from "pg";

export const db: any = process.env.DATABASE_URL
  ? drizzlePG(new Pool({ connectionString: process.env.DATABASE_URL }), { schema })
  : drizzleSQLite(new Database("chat.db"), { schema });