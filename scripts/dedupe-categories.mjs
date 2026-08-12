// One-off cleanup: for each user, collapse duplicate categories (same
// name+type) into a single one, re-linking any transactions that pointed
// at the duplicates before deleting them.
//
// Usage:
//   node scripts/dedupe-categories.mjs
//
// Reads MONGODB_URI from .env.local (same var the app uses).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const path = join(__dirname, "..", ".env.local");
  const text = readFileSync(path, "utf-8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: "financeweb" });
  const db = mongoose.connection.db;
  const categories = db.collection("categories");
  const transactions = db.collection("transactions");

  const all = await categories.find({}).sort({ createdAt: 1 }).toArray();

  const groups = new Map(); // key: userId|name|type -> [categories...]
  for (const cat of all) {
    const key = `${cat.userId}|${cat.name}|${cat.type}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(cat);
  }

  let groupsWithDuplicates = 0;
  let categoriesRemoved = 0;
  let transactionsRelinked = 0;

  for (const [key, group] of groups) {
    if (group.length <= 1) continue;
    groupsWithDuplicates++;

    const [keep, ...duplicates] = group; // oldest first, keep the earliest
    for (const dup of duplicates) {
      const result = await transactions.updateMany(
        { categoryId: dup._id },
        { $set: { categoryId: keep._id } }
      );
      transactionsRelinked += result.modifiedCount;
      await categories.deleteOne({ _id: dup._id });
      categoriesRemoved++;
    }
    console.log(`Merged ${duplicates.length} duplicate(s) of "${keep.name}" (${keep.type}) for user ${keep.userId}`);
  }

  console.log("---");
  console.log(`Category groups with duplicates: ${groupsWithDuplicates}`);
  console.log(`Duplicate categories removed: ${categoriesRemoved}`);
  console.log(`Transactions re-linked: ${transactionsRelinked}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
