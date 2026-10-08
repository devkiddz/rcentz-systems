import path from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  inspectDennisTracker,
  activateDennisTracker,
} from "./seeds/activate-dennis-tracker";
dotenv.config({
  path: [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
  ],
  quiet: true,
});
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 15000,
    }),
  });
  try {
    const state = await inspectDennisTracker(db);
    if (process.argv.includes("--apply")) {
      const result = await activateDennisTracker(db);
      console.log(
        result.changed
          ? "Synthetic analytics archived. Live collection enabled for https://dennis.rcentz.cc. Counters start at zero; invoices and other demo history are unchanged."
          : "Live collection is already configured. Existing data preserved.",
      );
    } else
      console.log(
        state.activated
          ? "PASS: live collection is already configured."
          : "PASS: demo ownership and synthetic analytics verified. No database changes made.",
      );
  } finally {
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Tracker setup failed.",
  );
  process.exitCode = 1;
});
