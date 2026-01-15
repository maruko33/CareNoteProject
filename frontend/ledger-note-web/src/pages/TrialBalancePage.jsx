import { useEffect, useState } from "react";
import { getTrialBalance } from "../api/reports";

function formatMinor(minor) {
  // 简单显示：CAD cents -> dollars（你后面也可以做更专业的 format）
  const n = Number(minor || 0);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}${(abs / 100).toFixed(2)}`;
}

export default function TrialBalancePage() {
  const [data, setData] = useState(null);
  const [asOf, setAsOf] = useState(""); // 用户可选
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const payload = await getTrialBalance({ asOf: asOf ? new Date(asOf).toISOString() : null });
      setData(payload);
    } catch (e) {
      setErr(e?.response?.data?.detail ?? "Failed to load trial balance");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h3 style={{ marginRight: "auto" }}>Trial Balance</h3>

        <input
          type="datetime-local"
          value={asOf}
          onChange={(e) => setAsOf(e.target.value)}
        />
        <button onClick={refresh}>Run</button>
      </div>

      {err && <div style={{ color: "crimson", marginTop: 10 }}>{String(err)}</div>}
      {loading && <div style={{ marginTop: 10 }}>Loading...</div>}

      {!loading && data && (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: "#666" }}>
            as_of: {new Date(data.as_of).toLocaleString()}
          </div>

          <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Account</th>
                <th align="left">Type</th>
                <th align="left">Currency</th>
                <th align="right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((l) => (
                <tr key={l.account_id}>
                  <td>{l.name}</td>
                  <td>{l.type}</td>
                  <td>{l.currency}</td>
                  <td align="right">{formatMinor(l.balance_minor)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 10, color: "#666" }}>
            Tip: balance is shown in major units (minor/100).
          </div>
        </div>
      )}
    </div>
  );
}
