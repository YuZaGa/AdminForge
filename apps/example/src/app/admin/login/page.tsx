"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => setError("Failed to initialize"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        redirect: "manual",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          csrfToken: formData.get("csrfToken") as string,
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        }),
      });

      if (res.type === "opaqueredirect" || res.status === 200) {
        router.push("/admin");
        router.refresh();
      } else {
        const text = await res.text().catch(() => "");
        setError(text.includes("Invalid") ? "Invalid email or password" : "Login failed");
      }
    } catch {
      setError("Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="adminforge-login-page">
      <div className="adminforge-login-card">
        <h1>AdminForge</h1>
        <p className="adminforge-login-subtitle">Sign in to your admin panel</p>
        <form onSubmit={handleSubmit} className="adminforge-login-form">
          {error && <div className="adminforge-login-error">{error}</div>}
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <div className="adminforge-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="adminforge-input"
              required
              autoFocus
            />
          </div>
          <div className="adminforge-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="adminforge-input"
              required
            />
          </div>
          <button
            type="submit"
            className="adminforge-btn adminforge-btn-primary adminforge-btn-block"
            disabled={loading || submitting}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
