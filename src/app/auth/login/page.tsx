"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, Mail, Lock, Code, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="hero-orb" style={{ width: 300, height: 300, background: '#6366f1', top: '10%', right: '20%', position: 'absolute', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.2 }} />
        <div className="hero-orb" style={{ width: 200, height: 200, background: '#06b6d4', bottom: '20%', left: '10%', position: 'absolute', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }} />
      </div>

      <div className="auth-container">
        <Link href="/" className="auth-logo">
          <div className="logo-icon" style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <Eye size={28} />
          </div>
          <span style={{ fontSize: 24, fontWeight: 800 }}>QA ROBO</span>
        </Link>

        <div className="auth-card glass-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          {/* Social Buttons */}
          <div className="auth-socials">
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <Code size={18} />
              GitHub
            </button>
          </div>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error">{error}</div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="input"
                  style={{ paddingLeft: 40 }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  className="input"
                  style={{ paddingLeft: 40 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 8 }}
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-footer-text">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 24px;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }
        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--text-primary);
        }
        .auth-card {
          width: 100%;
          padding: 36px;
        }
        .auth-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 24px;
        }
        .auth-socials {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          color: var(--text-muted);
          font-size: 12px;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-primary);
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .input-wrapper {
          position: relative;
        }
        .auth-error {
          padding: 10px 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .auth-footer-text {
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 20px;
        }
        .auth-link {
          color: var(--accent-primary-hover);
          text-decoration: none;
          font-weight: 600;
        }
        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
