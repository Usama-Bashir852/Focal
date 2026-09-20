import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";
import { APP_NAME } from "../brand.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("name", data.name);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="auth-brand-mark">{APP_NAME}</span>
        <div className="auth-brand-quote">
          <p>"The room is already set up. You just have to walk in."</p>
          <p className="muted">A whiteboard, a call, and a timer -- waiting where you left them.</p>
        </div>
        <span className="auth-brand-foot">Portfolio project</span>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <p className="subtitle">Log in to your rooms</p>
          {error && <div className="error">{error}</div>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="brass">Log in</button>
          <p className="switch">
            No account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
