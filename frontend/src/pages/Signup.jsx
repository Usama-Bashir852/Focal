import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";
import { APP_NAME } from "../brand.js";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/signup", { name, email, password });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("name", data.name);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="auth-brand-mark">{APP_NAME}</span>
        <div className="auth-brand-quote">
          <p>"Create a room, share the code, and you're already in session."</p>
          <p className="muted">No setup beyond that -- the whiteboard and timer are already there.</p>
        </div>
        <span className="auth-brand-foot">Portfolio project</span>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Create your account</h1>
          <p className="subtitle">Takes about a minute</p>
          {error && <div className="error">{error}</div>}
          <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button type="submit" className="brass">Sign up</button>
          <p className="switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
