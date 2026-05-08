"use client";

import { useState, useEffect } from "react";

function getErrorFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("error");
}

export default function LoginPage() {
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(getErrorFromUrl());
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adminforge-login-page">
      <div className="adminforge-login-card">
        <h1>AdminForge</h1>
        <p className="adminforge-login-subtitle">Sign in to your admin panel</p>
        {error && (
          <div className="adminforge-login-error">Invalid email or password</div>
        )}
        <form action="/api/auth/callback/credentials" method="POST" className="adminforge-login-form">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value="/" />
          <div className="adminforge-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="adminforge-input" required autoFocus />
          </div>
          <div className="adminforge-field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="adminforge-input" required />
          </div>
          <button type="submit" className="adminforge-btn adminforge-btn-primary adminforge-btn-block" disabled={loading || !csrfToken}>
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
