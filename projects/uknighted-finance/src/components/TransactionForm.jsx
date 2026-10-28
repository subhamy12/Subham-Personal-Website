import { useEffect, useRef, useState } from "react";
import { CATEGORIES, today } from "../lib/finance";

const emptyForm = (type = "expense") => ({
  type,
  amount: "",
  category: "",
  date: today(),
  note: "",
});

// Adds a new transaction, or edits one when `editing` is set.
export default function TransactionForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const amountRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setForm({ ...editing, amount: String(editing.amount) });
      setErrors({});
      amountRef.current?.focus();
    }
  }, [editing]);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const setType = (type) => {
    // Switching type clears a category that only belongs to the other type.
    setForm((f) => ({
      ...f,
      type,
      category: CATEGORIES[type].includes(f.category) ? f.category : "",
    }));
  };

  const validate = () => {
    const errs = {};
    const amount = Number(form.amount);
    if (!form.amount || !(amount > 0)) errs.amount = "Enter an amount above $0.";
    else if (!/^\d+(\.\d{1,2})?$/.test(form.amount)) errs.amount = "Use at most 2 decimal places.";
    if (!form.category) errs.category = "Pick a category.";
    if (!form.date) errs.date = "Pick a date.";
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...form, amount: Number(form.amount), note: form.note.trim() });
    setForm(emptyForm(form.type));
    amountRef.current?.focus();
  };

  const cancel = () => {
    setForm(emptyForm(form.type));
    setErrors({});
    onCancel();
  };

  return (
    <form
      className={`card form${editing ? " is-editing" : ""}`}
      onSubmit={submit}
      onKeyDown={(e) => e.key === "Escape" && editing && cancel()}
      noValidate
    >
      <div className="card-head">
        <h2>{editing ? "Edit transaction" : "Add a transaction"}</h2>
        {editing && <span className="pill pill-muted">Editing</span>}
      </div>

      <div className="segmented" role="radiogroup" aria-label="Transaction type">
        {["expense", "income"].map((type) => (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={form.type === type}
            className={form.type === type ? `active ${type}` : ""}
            onClick={() => setType(type)}
          >
            {type === "expense" ? "Expense" : "Income"}
          </button>
        ))}
      </div>

      <label className="field">
        <span>Amount</span>
        <div className="money-input">
          <span aria-hidden="true">$</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={update("amount")}
            aria-invalid={!!errors.amount}
          />
        </div>
        {errors.amount && <small className="error">{errors.amount}</small>}
      </label>

      <label className="field">
        <span>Category</span>
        <select value={form.category} onChange={update("category")} aria-invalid={!!errors.category}>
          <option value="">Choose…</option>
          {CATEGORIES[form.type].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && <small className="error">{errors.category}</small>}
      </label>

      <label className="field">
        <span>Date</span>
        <input type="date" value={form.date} onChange={update("date")} aria-invalid={!!errors.date} />
        {errors.date && <small className="error">{errors.date}</small>}
      </label>

      <label className="field">
        <span>
          Note <em>(optional)</em>
        </span>
        <input
          type="text"
          maxLength={60}
          placeholder="e.g. Dinner with friends"
          value={form.note}
          onChange={update("note")}
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {editing ? "Save changes" : `Add ${form.type}`}
        </button>
        {editing && (
          <button type="button" className="btn btn-ghost" onClick={cancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
