import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { categoryColor, formatMoney, monthKey, monthLabel } from "../lib/finance";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
};

// Spending by category (donut) and income vs. expenses per month (bars).
export default function Charts({ transactions }) {
  const byCategory = useMemo(() => {
    const sums = {};
    for (const t of transactions) {
      if (t.type === "expense") sums[t.category] = (sums[t.category] || 0) + t.amount;
    }
    return Object.entries(sums)
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const byMonth = useMemo(() => {
    const months = {};
    for (const t of transactions) {
      const key = monthKey(t.date);
      months[key] ??= { key, income: 0, expenses: 0 };
      if (t.type === "income") months[key].income += t.amount;
      else months[key].expenses += t.amount;
    }
    return Object.values(months)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6)
      .map((m) => ({ ...m, month: monthLabel(m.key) }));
  }, [transactions]);

  const totalSpent = byCategory.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="charts">
      <section className="card chart-card">
        <div className="card-head">
          <h2>Spending by category</h2>
        </div>
        {byCategory.length === 0 ? (
          <p className="empty">No expenses in this view.</p>
        ) : (
          <div className="donut-layout">
            <div className="donut">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius="62%"
                    outerRadius="95%"
                    paddingAngle={2}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {byCategory.map((c) => (
                      <Cell key={c.category} fill={categoryColor(c.category)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMoney(v)} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span>Spent</span>
                <strong>{formatMoney(totalSpent)}</strong>
              </div>
            </div>
            <ul className="legend">
              {byCategory.slice(0, 6).map((c) => (
                <li key={c.category}>
                  <span className="dot" style={{ background: categoryColor(c.category) }} />
                  <span className="legend-name">{c.category}</span>
                  <span className="legend-value">{Math.round((c.amount / totalSpent) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="card chart-card">
        <div className="card-head">
          <h2>Monthly cash flow</h2>
        </div>
        {byMonth.length === 0 ? (
          <p className="empty">No transactions in this view.</p>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={byMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => formatMoney(v)} contentStyle={tooltipStyle} cursor={{ fill: "var(--hover)" }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="income" name="Income" fill="var(--positive)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="expenses" name="Expenses" fill="var(--negative)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
