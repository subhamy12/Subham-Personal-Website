import { formatMoney } from "../lib/finance";

// Balance, income, expenses and savings rate for the filtered transactions.
export default function SummaryCards({ income, expenses, net, count }) {
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : null;

  return (
    <section className="summary" aria-label="Summary">
      <div className="card stat stat-balance">
        <span className="stat-label">Net balance</span>
        <strong className={net >= 0 ? "positive" : "negative"}>{formatMoney(net)}</strong>
        <span className="stat-sub">
          {count} transaction{count === 1 ? "" : "s"}
        </span>
      </div>
      <div className="card stat">
        <span className="stat-label">Income</span>
        <strong className="positive">{formatMoney(income)}</strong>
      </div>
      <div className="card stat">
        <span className="stat-label">Expenses</span>
        <strong className="negative">{formatMoney(expenses)}</strong>
      </div>
      <div className="card stat">
        <span className="stat-label">Savings rate</span>
        <strong>{savingsRate === null ? "—" : `${savingsRate}%`}</strong>
        <span className="stat-sub">of income kept</span>
      </div>
    </section>
  );
}
