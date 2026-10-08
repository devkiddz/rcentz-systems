import path from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  inspectOrder,
  completeDennisOrder,
} from "./seeds/complete-dennis-order";
import { SeedGuardError } from "./seeds/dennis-portfolio";
import { readPassword } from "./seeds/read-password";
import { verifyLiveAccess } from "./seeds/verify-live-access";
dotenv.config({
  path: [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
  ],
  quiet: true,
});
async function main() {
  const apply = process.argv.includes("--apply");
  if (apply && !process.argv.includes("--live"))
    throw new SeedGuardError(
      "Apply requires --live; this writes sample ledger records to DATABASE_URL.",
    );
  if (!process.env.DATABASE_URL)
    throw new SeedGuardError("DATABASE_URL is missing.");
  const url = new URL(process.env.DATABASE_URL);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
  )
    throw new SeedGuardError(
      "This installer requires a production PostgreSQL database.",
    );
  console.log("Database host:", url.hostname);
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 15000,
    }),
  });
  try {
    await inspectOrder(db);
    if (!apply) {
      console.log(
        "PASS: existing private demo ownership and billing identifiers verified. No changes made.",
      );
      return;
    }
    // Verify the current credentials before any writes. Never reset the account.
    let password = await readPassword();
    try {
      const before = await inspectOrder(db);
      await verifyLiveAccess(
        password,
        before.project.id,
        before.project.serviceRequestId,
      );
      const result = await completeDennisOrder(db);
      console.log(
        result.created
          ? "Saved accepted sample quote, three paid invoices, three simulated payments, billing reviews and six days of sample analytics."
          : "Demo expansion already installed; existing records preserved.",
      );
      await verifyLiveAccess(
        password,
        result.projectId,
        result.serviceRequestId,
      );
      console.log(
        "Open: https://systems.rcentz.cc/dashboard/projects/" +
          result.projectId,
      );
      console.log(
        "No real charge, email send, password reset or schema migration was performed.",
      );
    } finally {
      password = "";
    }
  } finally {
    await db.$disconnect();
  }
}
main().catch((error: unknown) => {
  console.error(
    error instanceof SeedGuardError
      ? error.message
      : "Stopped: database or live verification failed. No credentials were changed. Reruns preserve saved demo records.",
  );
  process.exitCode = 1;
});
