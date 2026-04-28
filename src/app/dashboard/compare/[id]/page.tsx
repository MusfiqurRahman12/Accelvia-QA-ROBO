"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Layers,
  SlidersHorizontal,
  Type,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";

type ViewMode = "side-by-side" | "overlay" | "diff";

export default function ComparisonResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [comparison, setComparison] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [activeTab, setActiveTab] = useState<"visual" | "typography" | "ai">("visual");
  const [sliderPos, setSliderPos] = useState(50);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/compare/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComparison(data.comparison);
      }
      setLoading(false);
    };

    fetchData();
    // Poll if still processing
    const interval = setInterval(async () => {
      const res = await fetch(`/api/compare/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComparison(data.comparison);
        if (data.comparison.status !== "processing") clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/report/${id}`, { method: "POST" });
      if (res.ok) {
        router.push(`/dashboard/report/${id}`);
      }
    } catch {
      console.error("Failed to generate report");
    }
    setReportLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 12 }}>
        <Loader2 size={24} className="spin" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ color: "var(--text-secondary)" }}>Loading comparison...</span>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div style={{ textAlign: "center", padding: 64 }}>
        <h2>Comparison not found</h2>
        <button className="btn btn-secondary" onClick={() => router.push("/dashboard")} style={{ marginTop: 16 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const status = comparison.status as string;
  const mismatchPercent = comparison.mismatchPercent as number | null;
  const typographyDiffs = (comparison.typographyDiffs || []) as Array<Record<string, unknown>>;
  const aiBugs = (comparison.aiBugs || []) as Array<Record<string, unknown>>;
  const refUrl = comparison.refScreenshotUrl as string | null;
  const devUrl = comparison.devScreenshotUrl as string | null;
  const diffUrl = comparison.diffImageUrl as string | null;

  const getMismatchColor = (pct: number) => {
    if (pct < 1) return "var(--success)";
    if (pct < 5) return "var(--warning)";
    return "var(--danger)";
  };

  return (
    <div>
      {/* Header */}
      <div className="result-header">
        <button className="btn btn-ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Comparison Results</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {comparison.devUrl as string}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={generateReport} disabled={reportLoading || status !== "done"}>
            {reportLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <FileText size={16} />}
            Generate Report
          </button>
        </div>
      </div>

      {/* Status */}
      {status === "processing" && (
        <div className="processing-banner glass-card">
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--accent-primary-hover)" }} />
          <span>Comparison is being processed... This page will auto-refresh.</span>
        </div>
      )}

      {status === "failed" && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>Comparison failed: {comparison.errorMessage as string || "Unknown error"}</span>
        </div>
      )}

      {status === "done" && (
        <>
          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat-pill" style={{ borderColor: getMismatchColor(mismatchPercent || 0) }}>
              <span style={{ color: getMismatchColor(mismatchPercent || 0), fontWeight: 800, fontSize: 20 }}>
                {mismatchPercent?.toFixed(2)}%
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Pixel Mismatch</span>
            </div>
            <div className="stat-pill">
              <span style={{ fontWeight: 800, fontSize: 20, color: typographyDiffs.length > 0 ? "var(--warning)" : "var(--success)" }}>
                {typographyDiffs.length}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Typography Issues</span>
            </div>
            <div className="stat-pill">
              <span style={{ fontWeight: 800, fontSize: 20, color: aiBugs.length > 0 ? "var(--danger)" : "var(--success)" }}>
                {aiBugs.length}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>AI Detected Bugs</span>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="tab-bar">
            <button className={`tab ${activeTab === "visual" ? "active" : ""}`} onClick={() => setActiveTab("visual")}>
              <Eye size={16} /> Visual Diff
            </button>
            <button className={`tab ${activeTab === "typography" ? "active" : ""}`} onClick={() => setActiveTab("typography")}>
              <Type size={16} /> Typography ({typographyDiffs.length})
            </button>
            <button className={`tab ${activeTab === "ai" ? "active" : ""}`} onClick={() => setActiveTab("ai")}>
              <Sparkles size={16} /> AI Bugs ({aiBugs.length})
            </button>
          </div>

          {/* Visual Diff Tab */}
          {activeTab === "visual" && (
            <div>
              <div className="view-mode-bar">
                <button className={`btn btn-sm ${viewMode === "side-by-side" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setViewMode("side-by-side")}>
                  <Layers size={14} /> Side by Side
                </button>
                <button className={`btn btn-sm ${viewMode === "overlay" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setViewMode("overlay")}>
                  <SlidersHorizontal size={14} /> Overlay Slider
                </button>
                <button className={`btn btn-sm ${viewMode === "diff" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setViewMode("diff")}>
                  <AlertTriangle size={14} /> Diff Highlight
                </button>
              </div>

              <div className="viewer-container glass-card">
                {viewMode === "side-by-side" && (
                  <div className="side-by-side">
                    <div className="side">
                      <div className="side-label">Reference</div>
                      {refUrl && <img src={refUrl} alt="Reference" className="comparison-img" />}
                    </div>
                    <div className="side">
                      <div className="side-label">Development</div>
                      {devUrl && <img src={devUrl} alt="Development" className="comparison-img" />}
                    </div>
                  </div>
                )}

                {viewMode === "overlay" && (
                  <div className="overlay-container">
                    <div className="overlay-ref" style={{ width: `${sliderPos}%` }}>
                      {refUrl && <img src={refUrl} alt="Reference" className="comparison-img" />}
                    </div>
                    <div className="overlay-dev">
                      {devUrl && <img src={devUrl} alt="Development" className="comparison-img" />}
                    </div>
                    <input type="range" min="0" max="100" value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="overlay-slider" />
                  </div>
                )}

                {viewMode === "diff" && (
                  <div className="diff-view">
                    {diffUrl && <img src={diffUrl} alt="Diff" className="comparison-img" />}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === "typography" && (
            <div className="glass-card" style={{ padding: 24, overflow: "auto" }}>
              {typographyDiffs.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                  <CheckCircle2 size={36} style={{ color: "var(--success)", marginBottom: 12 }} />
                  <p>No typography mismatches detected!</p>
                </div>
              ) : (
                <table className="typo-table">
                  <thead>
                    <tr>
                      <th>Element</th>
                      <th>Property</th>
                      <th>Expected</th>
                      <th>Actual</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typographyDiffs.map((diff, i) => (
                      <tr key={i}>
                        <td>
                          <span className="typo-text">{(diff.textContent as string)?.substring(0, 40)}</span>
                          <span className="typo-selector">{diff.elementSelector as string}</span>
                        </td>
                        <td><code>{diff.property as string}</code></td>
                        <td className="typo-expected">{diff.expected as string}</td>
                        <td className="typo-actual">{diff.actual as string}</td>
                        <td>
                          <span className={`severity-badge severity-${diff.severity}`}>
                            {diff.severity as string}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* AI Bugs Tab */}
          {activeTab === "ai" && (
            <div>
              {aiBugs.length === 0 ? (
                <div className="glass-card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
                  <Sparkles size={36} style={{ marginBottom: 12, color: "var(--text-muted)" }} />
                  <p>No AI analysis results. Enable AI detection in comparison settings.</p>
                </div>
              ) : (
                <div className="ai-bugs-grid">
                  {aiBugs.map((bug, i) => (
                    <div key={i} className="glass-card" style={{ padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span className={`severity-badge severity-${bug.severity}`}>{bug.severity as string}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                          {bug.category as string}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{bug.description as string}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .result-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .processing-banner {
          display: flex; align-items: center; gap: 12px; padding: 16px 20px;
          margin-bottom: 24px; color: var(--text-secondary); font-size: 14px;
        }
        .error-banner {
          display: flex; align-items: center; gap: 12px; padding: 16px 20px;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
          border-radius: var(--radius-md); margin-bottom: 24px; color: #fca5a5; font-size: 14px;
        }
        .stats-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .stat-pill {
          padding: 16px 24px; border-radius: var(--radius-lg);
          background: var(--bg-glass); backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          min-width: 140px;
        }
        .tab-bar { display: flex; gap: 4px; margin-bottom: 20px; background: var(--bg-secondary); border-radius: var(--radius-md); padding: 4px; }
        .tab {
          padding: 8px 16px; border: none; background: none; color: var(--text-secondary);
          font-family: inherit; font-size: 13px; font-weight: 600; border-radius: var(--radius-sm);
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all var(--transition-fast);
        }
        .tab.active { background: var(--accent-primary); color: white; }
        .view-mode-bar { display: flex; gap: 4px; margin-bottom: 16px; }
        .viewer-container { padding: 16px; overflow: auto; }
        .side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .side-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 8px; }
        .comparison-img { width: 100%; height: auto; border-radius: var(--radius-sm); }
        .overlay-container { position: relative; }
        .overlay-ref { position: absolute; top: 0; left: 0; overflow: hidden; height: 100%; z-index: 2; }
        .overlay-dev { position: relative; z-index: 1; }
        .overlay-slider { position: absolute; bottom: 16px; left: 16px; right: 16px; z-index: 10; }
        .diff-view { text-align: center; }
        .typo-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .typo-table th { text-align: left; padding: 10px 12px; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border-primary); }
        .typo-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .typo-text { display: block; font-weight: 600; font-size: 13px; }
        .typo-selector { display: block; font-size: 11px; color: var(--text-muted); font-family: monospace; }
        .typo-expected { color: var(--success); }
        .typo-actual { color: var(--danger); }
        .typo-table code { font-size: 12px; background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; }
        .severity-badge { padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .ai-bugs-grid { display: grid; gap: 12px; }
        @media (max-width: 768px) { .side-by-side { grid-template-columns: 1fr; } .stats-bar { flex-direction: column; } }
      `}</style>
    </div>
  );
}
