import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listEntries } from "../api/entries";

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const data = await listEntries();
      setEntries(data);
    } catch (e) {
      setErr(e?.response?.data?.detail ?? "Failed to load entries");
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
        <h3 style={{ marginRight: "auto" }}>Entries</h3>
        <Link to="/entries/new">
          <button>New Entry</button>
        </Link>
        <button onClick={refresh}>Refresh</button>
      </div>

      {err && <div style={{ color: "crimson", marginTop: 10 }}>{String(err)}</div>}
      {loading && <div style={{ marginTop: 10 }}>Loading...</div>}

      {!loading && (
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">Occurred</th>
              <th align="left">Description</th>
              <th align="left">Status</th>
              <th align="left">Postings</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{new Date(e.occurred_at).toLocaleString()}</td>
                <td>{e.description}</td>
                <td>{e.status}</td>
                <td>{e.postings?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
