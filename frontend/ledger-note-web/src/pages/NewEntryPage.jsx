import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAccounts } from "../api/accounts";
import { createEntry } from "../api/entries";

export default function NewEntryPage() {
  const nav = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 表单状态
  const [description, setDescription] = useState("Manual entry");
  const [currency, setCurrency] = useState("CAD");
  const [amountMinor, setAmountMinor] = useState(100); // 默认 1.00 = 100 cents
  const [debitAccountId, setDebitAccountId] = useState("");
  const [creditAccountId, setCreditAccountId] = useState("");

  // 只显示 active accounts（更像真实产品）
  const activeAccounts = useMemo(
    () => accounts.filter((a) => a.is_active),
    [accounts]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const data = await listAccounts({ limit: 200, offset: 0 });
        setAccounts(data);

        // 默认选两个不同账户（如果存在）
        if (data.length >= 2) {
          setDebitAccountId(String(data[0].id));
          setCreditAccountId(String(data[1].id));
          setCurrency(data[0].currency || "CAD");
        } else if (data.length === 1) {
          setDebitAccountId(String(data[0].id));
          setCurrency(data[0].currency || "CAD");
        }
      } catch (e) {
        setErr(e?.response?.data?.detail ?? "Failed to load accounts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const canSubmit =
    debitAccountId &&
    creditAccountId &&
    debitAccountId !== creditAccountId &&
    Number.isFinite(Number(amountMinor)) &&
    Number(amountMinor) !== 0;

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);

    try {
      const amt = parseInt(String(amountMinor), 10);
      const payload = {
        occurred_at: new Date().toISOString(),
        description,
        postings: [
          {
            ledger_account_id: parseInt(debitAccountId, 10),
            amount_minor: Math.abs(amt), // 借方 +
            currency,
            memo: "debit",
          },
          {
            ledger_account_id: parseInt(creditAccountId, 10),
            amount_minor: -Math.abs(amt), // 贷方 -
            currency,
            memo: "credit",
          },
        ],
      };

      await createEntry(payload);
      nav("/entries"); // 创建成功回列表
    } catch (e) {
      setErr(e?.response?.data?.detail ?? "Failed to create entry");
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>New Entry</h3>

      {err && <div style={{ color: "crimson", marginBottom: 10 }}>{String(err)}</div>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>
          Amount (minor units, e.g., cents)
          <input
            type="number"
            value={amountMinor}
            onChange={(e) => setAmountMinor(e.target.value)}
          />
        </label>

        <label>
          Currency
          <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
        </label>

        <label>
          Debit Account
          <select value={debitAccountId} onChange={(e) => setDebitAccountId(e.target.value)}>
            <option value="" disabled>
              Select...
            </option>
            {activeAccounts.map((a) => (
              <option key={a.id} value={String(a.id)}>
                #{a.id} — {a.name} ({a.type})
              </option>
            ))}
          </select>
        </label>

        <label>
          Credit Account
          <select value={creditAccountId} onChange={(e) => setCreditAccountId(e.target.value)}>
            <option value="" disabled>
              Select...
            </option>
            {activeAccounts.map((a) => (
              <option key={a.id} value={String(a.id)}>
                #{a.id} — {a.name} ({a.type})
              </option>
            ))}
          </select>
        </label>

        {!canSubmit && (
          <div style={{ color: "#666" }}>
            Tip: choose two different accounts and a non-zero amount.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={!canSubmit}>
            Create
          </button>
          <button type="button" onClick={() => nav("/entries")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
