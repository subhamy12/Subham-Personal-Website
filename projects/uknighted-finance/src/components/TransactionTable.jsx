import { useEffect, useMemo, useState } from "react";
import { categoryColor, formatDate, formatMoney } from "../lib/finance";

const PAGE_SIZE = 8;

const COLUMNS = [
  { key: "date", label: "Date" },
  { key: "note", label: "Description" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount", align: "right" },
];

const compare = {
  date: (a, b) => a.date.localeCompare(b.date),
  note: (a, b) => (a.note || a.category).localeCompare(b.note || b.category),
  category: (a, b) => a.category.localeCompare(b.category),
  amount: (a, b) =>
    (a.type === "income" ? a.amount : -a.amount) - (b.type === "income" ? b.amount : -b.amount),
};

// Sortable, paginated transaction history.
export default function TransactionTable({ transactions, editingId, onEdit, onDelete, onExport }) {
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const list = [...transactions].sort(compare[sort.key]);
    return sort.dir === "desc" ? list.reverse() : list;
  }, [transactions, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  // Go back to a valid page when filters shrink the list.
  useEffect(() => {
    if (page > pageCount - 1) setPage(pageCount - 1);
  }, [page, pageCount]);

  const rows = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  return (
    <section className="card history">
      <div className="card-head">
        <h2>Transaction history</h2>
        <button type="button" className="btn btn-ghost btn-small" onClick={onExport} disabled={!sorted.length}>
          Export CSV
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="empty">No transactions match these filters.</p>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={col.align === "right" ? "right" : undefined}
                      aria-sort={
                        sort.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
                      }
                    >
                      <button type="button" onClick={() => toggleSort(col.key)}>
                        {col.label}
                        <span className="sort-icon" aria-hidden="true">
                          {sort.key === col.key ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className={t.id === editingId ? "row-editing" : undefined}>
                    <td className="nowrap">{formatDate(t.date)}</td>
                    <td>{t.note || <span className="muted">{t.category}</span>}</td>
                    <td>
                      <span className="pill">
                        <span
                          className="dot"
                          style={{ background: t.type === "income" ? "var(--positive)" : categoryColor(t.category) }}
                        />
                        {t.category}
                      </span>
                    </td>
                    <td className={`right nowrap ${t.type === "income" ? "positive" : "negative"}`}>
                      {t.type === "income" ? "+" : "−"}
                      {formatMoney(t.amount)}
                    </td>
                    <td className="actions">
                      <button type="button" className="icon-btn" onClick={() => onEdit(t)} aria-label={`Edit ${t.note || t.category}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4z" /></svg>
                      </button>
                      <button type="button" className="icon-btn danger" onClick={() => onDelete(t)} aria-label={`Delete ${t.note || t.category}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <span>
              {page * PAGE_SIZE + 1}–{Math.min(sorted.length, (page + 1) * PAGE_SIZE)} of {sorted.length}
            </span>
            <div>
              <button type="button" className="icon-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 0} aria-label="Previous page">
                ‹
              </button>
              <button type="button" className="icon-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= pageCount - 1} aria-label="Next page">
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
