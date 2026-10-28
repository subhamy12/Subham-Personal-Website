import { useCallback, useMemo, useState } from "react";
import BudgetCard from "./components/BudgetCard";
import Charts from "./components/Charts";
import Filters, { defaultFilters } from "./components/Filters";
import SummaryCards from "./components/SummaryCards";
import ThemeToggle from "./components/ThemeToggle";
import Toast from "./components/Toast";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import { monthKey, newId, rangeStart, sampleTransactions, today, toCSV, totals } from "./lib/finance";
import { useLocalStorage } from "./lib/useLocalStorage";
import "./App.css";

export default function App() {
  const [transactions, setTransactions] = useLocalStorage("uknighted:transactions", sampleTransactions);
  const [budget, setBudget] = useLocalStorage("uknighted:budget", 600);
  const [filters, setFilters] = useState(defaultFilters);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message, action) => setToast({ id: Date.now(), message, action });
  const closeToast = useCallback(() => setToast(null), []);

  // Every view (summary, charts, table) uses the same filtered list.
  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const start = filters.range === "custom" ? filters.start : rangeStart(filters.range);
    const end = filters.range === "custom" ? filters.end : null;

    return transactions.filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (start && t.date < start) return false;
      if (end && t.date > end) return false;
      if (search) {
        const haystack = `${t.note} ${t.category} ${t.amount.toFixed(2)}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const summary = useMemo(() => totals(filtered), [filtered]);

  const spentThisMonth = useMemo(() => {
    const month = monthKey(today());
    return transactions
      .filter((t) => t.type === "expense" && monthKey(t.date) === month)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const saveTransaction = (data) => {
    if (editing) {
      setTransactions((list) => list.map((t) => (t.id === editing.id ? { ...data, id: editing.id } : t)));
      setEditing(null);
      notify("Transaction updated");
    } else {
      setTransactions((list) => [...list, { ...data, id: newId() }]);
      notify(`${data.type === "income" ? "Income" : "Expense"} added`);
    }
  };

  const deleteTransaction = (transaction) => {
    const index = transactions.findIndex((t) => t.id === transaction.id);
    setTransactions((list) => list.filter((t) => t.id !== transaction.id));
    if (editing?.id === transaction.id) setEditing(null);
    notify("Transaction deleted", {
      label: "Undo",
      run: () =>
        setTransactions((list) => {
          const restored = [...list];
          restored.splice(index, 0, transaction);
          return restored;
        }),
    });
  };

  const exportCSV = () => {
    const blob = new Blob([toCSV(filtered)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uknighted-finance-${today()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`);
  };

  const resetDemo = () => {
    if (!window.confirm("Replace your transactions with the sample data?")) return;
    setTransactions(sampleTransactions());
    setBudget(600);
    setFilters(defaultFilters);
    setEditing(null);
    notify("Sample data restored");
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>
            UKNIGHTed <span>Finance</span>
          </h1>
          <p>Track what comes in, what goes out, and where it goes.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-ghost btn-small" onClick={resetDemo}>
            Reset sample data
          </button>
          <ThemeToggle />
        </div>
      </header>

      <Filters filters={filters} onChange={setFilters} />

      <SummaryCards {...summary} count={filtered.length} />

      <div className="layout">
        <aside className="sidebar">
          <TransactionForm editing={editing} onSave={saveTransaction} onCancel={() => setEditing(null)} />
          <BudgetCard budget={budget} spent={spentThisMonth} onChange={setBudget} />
        </aside>

        <main className="main">
          <Charts transactions={filtered} />
          <TransactionTable
            transactions={filtered}
            editingId={editing?.id}
            onEdit={setEditing}
            onDelete={deleteTransaction}
            onExport={exportCSV}
          />
        </main>
      </div>

      <footer className="app-footer">
        Built by Subham Yadav, Sumedha Balwadgi and Adhyaksha Chandrasekaran · Data is saved only in this browser
      </footer>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
