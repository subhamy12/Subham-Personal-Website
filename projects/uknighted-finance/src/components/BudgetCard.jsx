import { useState } from "react";
import { formatMoney } from "../lib/finance";

// Monthly spending budget with a progress bar for the current month.
export default function BudgetCard({ budget, spent, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(budget));

  const percent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const left = budget - spent;
  const status = percent >= 100 ? "over" : percent >= 80 ? "warn" : "ok";
  const month = new Date().toLocaleDateString("en-US", { month: "long" });

  const save = (e) => {
    e.preventDefault();
    const value = Number(draft);
    if (value > 0) onChange(Math.round(value * 100) / 100);
    setEditing(false);
  };

  return (
    <section className="card budget">
      <div className="card-head">
        <h2>{month} budget</h2>
        {!editing && (
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setDraft(String(budget));
              setEditing(true);
            }}
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form className="budget-edit" onSubmit={save}>
          <div className="money-input">
            <span aria-hidden="true">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Monthly budget"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </form>
      ) : (
        <>
          <p className="budget-figures">
            <strong>{formatMoney(spent)}</strong> of {formatMoney(budget)} spent
          </p>
          <div
            className={`progress ${status}`}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Budget used"
          >
            <span style={{ width: `${percent}%` }} />
          </div>
          <p className={`budget-note ${status}`}>
            {left >= 0
              ? `${formatMoney(left)} left this month`
              : `${formatMoney(-left)} over budget`}
          </p>
        </>
      )}
    </section>
  );
}
