// One-off cleanup: normalize casing of tags already stored on transactions
// (e.g. "donacion" / "DONACION" / "Donacion" all become "Donacion"), matching
// the normalization the app now applies automatically on every save.
//
// Usage:
//   node scripts/normalize-tags.mjs
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

function normalizeTag(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function normalizeTags(tags) {
  const seen = new Set();
  const result = [];
  for (const raw of tags) {
    const normalized = normalizeTag(raw);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
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
  const transactions = db.collection("transactions");

  const all = await transactions.find({ tags: { $exists: true, $ne: [] } }).toArray();

  let updated = 0;
  for (const tx of all) {
    const normalized = normalizeTags(tx.tags);
    const changed =
      normalized.length !== tx.tags.length || normalized.some((t, i) => t !== tx.tags[i]);
    if (!changed) continue;
    await transactions.updateOne({ _id: tx._id }, { $set: { tags: normalized } });
    updated++;
  }

  console.log(`Checked ${all.length} transaction(s) with tags, updated ${updated}.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
