import { describe, expect, it } from "vitest";
import { overallSavings, summarizeByMonth, totalByCategory } from "./aggregations";

const tx = (type: "expense" | "income", amount: number, date: string, categoryId = "c1") => ({
  type,
  amount,
  date,
  categoryId,
});

describe("summarizeByMonth", () => {
  it("groups by month and computes savings rate", () => {
    const result = summarizeByMonth([
      tx("income", 2000, "2026-01-05"),
      tx("expense", 1500, "2026-01-10"),
      tx("income", 2000, "2026-02-01"),
      tx("expense", 2200, "2026-02-15"),
    ]);

    expect(result).toEqual([
      { month: "2026-01", income: 2000, expense: 1500, savings: 500, savingsRate: 0.25 },
      { month: "2026-02", income: 2000, expense: 2200, savings: -200, savingsRate: -0.1 },
    ]);
  });

  it("returns savingsRate 0 when there is no income", () => {
    const result = summarizeByMonth([tx("expense", 100, "2026-03-01")]);
    expect(result[0].savingsRate).toBe(0);
  });
});

describe("totalByCategory", () => {
  it("sums amounts per category for the given type", () => {
    const result = totalByCategory([
      tx("expense", 100, "2026-01-01", "food"),
      tx("expense", 50, "2026-01-02", "food"),
      tx("expense", 30, "2026-01-03", "leisure"),
      tx("income", 1000, "2026-01-01", "salary"),
    ]);

    expect(result).toEqual([
      { categoryId: "food", total: 150 },
      { categoryId: "leisure", total: 30 },
    ]);
  });
});

describe("overallSavings", () => {
  it("computes totals and rate across all transactions", () => {
    const result = overallSavings([
      tx("income", 1000, "2026-01-01"),
      tx("income", 500, "2026-02-01"),
      tx("expense", 600, "2026-01-15"),
    ]);
    expect(result).toEqual({ income: 1500, expense: 600, savings: 900, savingsRate: 0.6 });
  });
});
