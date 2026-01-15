import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function RegisterPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    try {
      await register(email, password);
      setOk("Registered! Redirecting to login...");
      setTimeout(() => nav("/login"), 700);
    } catch (e) {
      setErr(e?.response?.data?.detail ?? "Register failed");
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <h3>Register</h3>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={!email || !password}>
          Create account
        </button>

        {ok && <div style={{ color: "green" }}>{ok}</div>}
        {err && <div style={{ color: "crimson" }}>{String(err)}</div>}
      </form>

      <div style={{ marginTop: 10 }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
