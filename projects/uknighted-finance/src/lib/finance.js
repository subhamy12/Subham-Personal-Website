// Shared constants and helpers for UKNIGHTed Finance.

export const CATEGORIES = {
  income: ["Paycheck", "Side Job", "Gift", "Other Income"],
  expense: [
    "Groceries",
    "Restaurants",
    "Entertainment",
    "Leisure",
    "Shopping",
    "Transportation",
    "Car",
    "Rent",
    "Utilities",
    "Health Care",
    "Insurance",
    "Education",
    "Other Spending",
  ],
};

// One color per expense category, used by the chart and the category pills.
const PALETTE = [
  "#2f7a74", "#e07a5f", "#3d5a80", "#f2cc8f", "#81b29a", "#9c6644",
  "#6d597a", "#e5989b", "#118ab2", "#ef476f", "#8d99ae", "#06d6a0", "#ffb703",
];

export const categoryColor = (category) => {
  const index = CATEGORIES.expense.indexOf(category);
  return index === -1 ? "#2f7a74" : PALETTE[index % PALETTE.length];
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const formatMoney = (value) => currency.format(value);

// Dates are stored as local "YYYY-MM-DD" strings so they sort and compare as text.
export const toISODate = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export const today = () => toISODate(new Date());

export const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
};

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const monthKey = (iso) => iso.slice(0, 7);

export const monthLabel = (key) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

export const totals = (transactions) => {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, net: income - expenses };
};

// The start date for each quick date-range option ("all" has none).
export const rangeStart = (range) => {
  if (range === "month") return `${today().slice(0, 7)}-01`;
  if (range === "30d") return daysAgo(29);
  if (range === "90d") return daysAgo(89);
  return null;
};

export const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Sample data spread over the last few months so every view has something to show.
export const sampleTransactions = () => [
  { type: "income", amount: 850, category: "Paycheck", date: daysAgo(2), note: "Part-time job" },
  { type: "expense", amount: 64.25, category: "Groceries", date: daysAgo(3), note: "Weekly groceries" },
  { type: "expense", amount: 18.99, category: "Entertainment", date: daysAgo(5), note: "Streaming + movie" },
  { type: "expense", amount: 45, category: "Transportation", date: daysAgo(7), note: "Gas" },
  { type: "expense", amount: 32.5, category: "Restaurants", date: daysAgo(9), note: "Dinner with friends" },
  { type: "income", amount: 120, category: "Side Job", date: daysAgo(12), note: "Tutoring" },
  { type: "expense", amount: 41.75, category: "Groceries", date: daysAgo(16), note: "" },
  { type: "expense", amount: 89.99, category: "Education", date: daysAgo(20), note: "Textbook" },
  { type: "income", amount: 850, category: "Paycheck", date: daysAgo(32), note: "Part-time job" },
  { type: "expense", amount: 58.4, category: "Groceries", date: daysAgo(35), note: "" },
  { type: "expense", amount: 120, category: "Car", date: daysAgo(38), note: "Oil change" },
  { type: "expense", amount: 26, category: "Restaurants", date: daysAgo(41), note: "" },
  { type: "expense", amount: 74.5, category: "Shopping", date: daysAgo(47), note: "Running shoes" },
  { type: "income", amount: 50, category: "Gift", date: daysAgo(50), note: "Birthday" },
  { type: "income", amount: 850, category: "Paycheck", date: daysAgo(62), note: "Part-time job" },
  { type: "expense", amount: 61.2, category: "Groceries", date: daysAgo(64), note: "" },
  { type: "expense", amount: 35, category: "Leisure", date: daysAgo(70), note: "Climbing gym" },
  { type: "expense", amount: 210, category: "Insurance", date: daysAgo(75), note: "Car insurance" },
].map((t) => ({ ...t, id: newId() }));

export const toCSV = (transactions) => {
  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const header = ["Date", "Type", "Category", "Amount", "Note"];
  const rows = transactions.map((t) =>
    [t.date, t.type === "income" ? "Income" : "Expense", t.category, t.amount.toFixed(2), t.note]
      .map(escape)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
};
