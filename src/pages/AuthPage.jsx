import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { saveSession } from "../services/liveOrder";
import "./AuthPage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const destination = location.state?.from || "/home";

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setLoading(true);
      const result =
        mode === "login"
          ? await api.login({ email: email.trim(), password })
          : await api.register({
              name: name.trim(),
              email: email.trim(),
              password,
              phone: phone.trim(),
              role: "customer",
            });

      saveSession(result);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">NAJAF</div>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtitle">
          Sign in to order food, save your location and follow your delivery live.
        </p>

        <div className="auth-tabs">
          <button
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("login");
              setError("");
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setMode("register");
              setError("");
            }}
            type="button"
          >
            Register
          </button>
        </div>

        {error ? <div className="auth-error">{error}</div> : null}

        <form onSubmit={submit}>
          {mode === "register" ? (
            <>
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />

              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
            </>
          ) : null}

          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
          />

          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength="6"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          <button className="auth-submit" disabled={loading} type="submit">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <button className="auth-back" type="button" onClick={() => navigate("/home")}>
          Continue as guest
        </button>
      </div>
    </section>
  );
};

export default AuthPage;
