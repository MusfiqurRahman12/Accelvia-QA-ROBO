"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Type,
  Smartphone,
  Sparkles,
  FileText,
  ArrowRight,
  Layers,
  CheckCircle2,
  Zap,
  Shield,
  MonitorSmartphone,
} from "lucide-react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav" style={{ 
        background: scrollY > 50 ? 'rgba(10, 11, 20, 0.9)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
      }}>
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">
              <Eye size={24} />
            </div>
            <span className="logo-text">QA ROBO</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <Link href="/auth/login" className="nav-link">Login</Link>
            <Link href="/auth/register" className="btn btn-primary btn-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero animated-gradient-bg">
        {/* Floating orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-content">
          <div className="hero-badge animate-fade-in-up">
            <Sparkles size={14} />
            <span>AI-Powered Visual QA</span>
          </div>

          <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Catch Every Pixel.<br />
            <span className="gradient-text">Before Your Users Do.</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Compare your live website against Figma designs, reference URLs, or mockup images.
            Detect visual differences, typography mismatches, and responsive bugs — automatically.
          </p>

          <div className="hero-actions animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Start Free Comparison
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="hero-stats animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="stat">
              <span className="stat-number">0.01px</span>
              <span className="stat-label">Detection Accuracy</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">6+</span>
              <span className="stat-label">Viewport Sizes</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free to Start</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="hero-browser glass-card">
            <div className="browser-bar">
              <div className="browser-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="browser-url">qarobo.app/compare</div>
            </div>
            <div className="browser-content">
              <div className="comparison-preview">
                <div className="preview-side preview-ref">
                  <div className="preview-label">Reference Design</div>
                  <div className="preview-placeholder">
                    <Layers size={32} />
                    <span>Figma / Image</span>
                  </div>
                </div>
                <div className="preview-divider">
                  <div className="divider-handle" />
                </div>
                <div className="preview-side preview-dev">
                  <div className="preview-label">Dev Build</div>
                  <div className="preview-placeholder">
                    <MonitorSmartphone size={32} />
                    <span>Live Website</span>
                  </div>
                </div>
              </div>
              <div className="preview-results">
                <div className="result-badge severity-critical">3 Critical</div>
                <div className="result-badge severity-major">5 Major</div>
                <div className="result-badge severity-minor">2 Minor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Everything You Need for <span className="gradient-text">Pixel-Perfect QA</span>
            </h2>
            <p className="section-subtitle">
              From pixel-level diffs to AI-powered bug detection — QA ROBO has you covered.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<Eye size={28} />}
              title="Pixel-by-Pixel Comparison"
              description="Compare screenshots at sub-pixel accuracy. Instantly see every visual difference highlighted in a diff overlay."
              color="#6366f1"
            />
            <FeatureCard
              icon={<Type size={28} />}
              title="Typography Analysis"
              description="Detect mismatches in font family, size, weight, line height, letter spacing, and color automatically."
              color="#06b6d4"
            />
            <FeatureCard
              icon={<Smartphone size={28} />}
              title="Responsive Testing"
              description="Compare layouts across 6+ viewport sizes simultaneously. Catch mobile, tablet, and desktop issues."
              color="#8b5cf6"
            />
            <FeatureCard
              icon={<Sparkles size={28} />}
              title="AI Bug Detection"
              description="GPT-4o Vision analyzes your UI for spacing, alignment, overflow, and missing element issues."
              color="#f59e0b"
            />
            <FeatureCard
              icon={<Layers size={28} />}
              title="Figma Integration"
              description="Paste a Figma link and automatically export frames for comparison. Extract design tokens directly."
              color="#ec4899"
            />
            <FeatureCard
              icon={<FileText size={28} />}
              title="Bug Reports"
              description="Auto-generate comprehensive bug reports. Edit, copy, or export as PDF with one click."
              color="#22c55e"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Three Steps to <span className="gradient-text">Perfect QA</span>
            </h2>
          </div>

          <div className="steps-grid">
            <StepCard
              number="01"
              title="Upload Reference"
              description="Paste a Figma link, upload a design image, or enter a reference URL."
              icon={<Layers size={24} />}
            />
            <StepCard
              number="02"
              title="Enter Dev URL"
              description="Provide your development site URL and select viewport sizes to test."
              icon={<Zap size={24} />}
            />
            <StepCard
              number="03"
              title="Get Results"
              description="View pixel diffs, typography mismatches, and AI-detected bugs. Export bug reports."
              icon={<CheckCircle2 size={24} />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card glass-card">
            <h2 className="cta-title">Ready to Ship Pixel-Perfect UIs?</h2>
            <p className="cta-subtitle">
              Start comparing your designs for free. No credit card required.
            </p>
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="logo-icon"><Eye size={20} /></div>
                <span className="logo-text">QA ROBO</span>
              </div>
              <p className="footer-desc">AI-powered visual QA for modern teams.</p>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <Link href="/auth/login">Login</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} QA ROBO. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
        }

        /* Nav */
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 16px 0;
          transition: all var(--transition-base);
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .logo-text {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color var(--transition-fast);
        }
        .nav-link:hover { color: var(--text-primary); }

        /* Hero */
        .hero {
          position: relative;
          padding: 140px 24px 80px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
        }
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          pointer-events: none;
        }
        .hero-orb-1 {
          width: 400px;
          height: 400px;
          background: #6366f1;
          top: -100px;
          right: -100px;
          animation: float 8s ease-in-out infinite;
        }
        .hero-orb-2 {
          width: 300px;
          height: 300px;
          background: #06b6d4;
          bottom: 100px;
          left: -50px;
          animation: float 10s ease-in-out infinite reverse;
        }
        .hero-orb-3 {
          width: 200px;
          height: 200px;
          background: #8b5cf6;
          top: 40%;
          right: 20%;
          animation: float 12s ease-in-out infinite;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          text-align: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 100px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: var(--accent-primary-hover);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }
        .hero-subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 36px;
          line-height: 1.7;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          margin-top: 64px;
          flex-wrap: wrap;
        }
        .stat { text-align: center; }
        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 800;
          color: var(--accent-primary-hover);
        }
        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
        }
        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border-primary);
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 900px;
          margin-top: 48px;
        }
        .hero-browser {
          padding: 0;
          overflow: hidden;
        }
        .browser-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-primary);
          background: rgba(18, 19, 31, 0.8);
        }
        .browser-dots { display: flex; gap: 6px; }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot-red { background: #ef4444; }
        .dot-yellow { background: #f59e0b; }
        .dot-green { background: #22c55e; }
        .browser-url {
          flex: 1;
          padding: 6px 12px;
          background: rgba(10, 11, 20, 0.6);
          border-radius: var(--radius-sm);
          font-size: 12px;
          color: var(--text-muted);
        }
        .browser-content {
          padding: 24px;
        }
        .comparison-preview {
          display: flex;
          gap: 2px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .preview-side {
          flex: 1;
          padding: 32px 16px;
          text-align: center;
        }
        .preview-ref { background: rgba(99, 102, 241, 0.08); }
        .preview-dev { background: rgba(6, 182, 212, 0.08); }
        .preview-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .preview-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 13px;
        }
        .preview-divider {
          width: 3px;
          background: var(--accent-primary);
          position: relative;
          cursor: col-resize;
        }
        .divider-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 40px;
          background: var(--accent-primary);
          border-radius: 10px;
        }
        .preview-results {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .result-badge {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Features */
        .features-section {
          padding: 120px 24px;
          background: var(--bg-secondary);
        }
        .section-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .section-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }
        .section-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        /* How It Works */
        .how-section {
          padding: 120px 24px;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
          max-width: 900px;
          margin: 0 auto;
        }

        /* CTA */
        .cta-section {
          padding: 80px 24px;
        }
        .cta-card {
          padding: 80px 40px;
          text-align: center;
        }
        .cta-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 800;
          margin-bottom: 16px;
        }
        .cta-subtitle {
          color: var(--text-secondary);
          margin-bottom: 32px;
        }

        /* Footer */
        .landing-footer {
          padding: 48px 24px;
          border-top: 1px solid var(--border-primary);
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 24px;
        }
        .footer-desc {
          color: var(--text-muted);
          font-size: 14px;
          margin-top: 8px;
        }
        .footer-links {
          display: flex;
          gap: 24px;
        }
        .footer-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          transition: color var(--transition-fast);
        }
        .footer-links a:hover { color: var(--text-primary); }
        .footer-bottom {
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 120px 16px 60px; }
          .hero-stats { gap: 20px; }
          .stat-divider { display: none; }
          .comparison-preview { flex-direction: column; }
          .preview-divider { width: 100%; height: 3px; }
          .divider-handle { width: 40px; height: 20px; }
          .features-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="glass-card" style={{ padding: "32px" }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "var(--radius-md)",
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          marginBottom: 20,
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass-card" style={{ padding: "32px", textAlign: "center" }}>
      <div
        style={{
          fontSize: 48,
          fontWeight: 900,
          background: "var(--accent-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 16,
        }}
      >
        {number}
      </div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent-primary-hover)",
          margin: "0 auto 16px",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
        {description}
      </p>
    </div>
  );
}
