import { CATEGORIES } from "../lib/finance";

const RANGES = [
  { value: "month", label: "This month" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

export const defaultFilters = {
  search: "",
  type: "all",
  category: "all",
  range: "all",
  start: "",
  end: "",
};

// Search, type, category and date filters. Every view on the page uses the result.
export default function Filters({ filters, onChange }) {
  const set = (field, value) => onChange({ ...filters, [field]: value });
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  const categories =
    filters.type === "all" ? [...CATEGORIES.income, ...CATEGORIES.expense] : CATEGORIES[filters.type];

  return (
    <section className="card filters" aria-label="Filters">
      <input
        type="search"
        className="search"
        placeholder="Search notes, categories or amounts…"
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        aria-label="Search transactions"
      />

      <div className="filter-row">
        <div className="chips" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              className={filters.range === r.value ? "chip active" : "chip"}
              aria-pressed={filters.range === r.value}
              onClick={() => set("range", r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <select
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value, category: "all" })}
          aria-label="Transaction type"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => set("category", e.target.value)}
          aria-label="Category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {isFiltered && (
          <button type="button" className="link-btn" onClick={() => onChange(defaultFilters)}>
            Clear filters
          </button>
        )}
      </div>

      {filters.range === "custom" && (
        <div className="filter-row custom-range">
          <label>
            From
            <input type="date" value={filters.start} onChange={(e) => set("start", e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={filters.end} onChange={(e) => set("end", e.target.value)} />
          </label>
          {filters.start && filters.end && filters.start > filters.end && (
            <small className="error">The start date is after the end date.</small>
          )}
        </div>
      )}
    </section>
  );
}
