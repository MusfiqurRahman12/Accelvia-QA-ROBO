"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Link2,
  PenTool,
  Smartphone,
  Tablet,
  Monitor,
  MonitorPlay,
  Sparkles,
  Type,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

const BREAKPOINTS = [
  { width: 375, height: 812, label: "Mobile", icon: Smartphone },
  { width: 768, height: 1024, label: "Tablet", icon: Tablet },
  { width: 1024, height: 768, label: "Laptop", icon: Monitor },
  { width: 1440, height: 900, label: "Desktop", icon: MonitorPlay },
  { width: 1920, height: 1080, label: "Full HD", icon: Monitor },
];

export default function ComparePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [referenceType, setReferenceType] = useState<"image" | "url" | "figma">("url");
  const [referenceSource, setReferenceSource] = useState("");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [devUrl, setDevUrl] = useState("");
  const [selectedViewports, setSelectedViewports] = useState([3]); // Desktop by default
  const [enableAI, setEnableAI] = useState(false);
  const [enableTypography, setEnableTypography] = useState(true);
  const [fullPageScan, setFullPageScan] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleViewport = (index: number) => {
    setSelectedViewports((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("projectName", projectName || `Comparison ${new Date().toLocaleDateString()}`);
      formData.append("referenceType", referenceType);
      formData.append("devUrl", devUrl);
      formData.append("enableAI", String(enableAI));
      formData.append("enableTypography", String(enableTypography));
      formData.append("fullPageScan", String(fullPageScan));

      if (referenceType === "image" && referenceFile) {
        formData.append("referenceFile", referenceFile);
      } else {
        formData.append("referenceSource", referenceSource);
      }

      const viewports = selectedViewports.map((i) => BREAKPOINTS[i]);
      formData.append("viewports", JSON.stringify(viewports));

      const res = await fetch("/api/compare", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      router.push(`/dashboard/compare/${data.comparisonIds[0]}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Comparison</h1>
          <p className="page-subtitle">Compare your dev site against a design reference</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="wizard-progress">
        {[
          { num: 1, label: "Reference" },
          { num: 2, label: "Dev URL" },
          { num: 3, label: "Viewports" },
          { num: 4, label: "Options" },
        ].map(({ num, label }) => (
          <div key={num} className={`progress-step ${step >= num ? "active" : ""} ${step === num ? "current" : ""}`}>
            <div className="step-dot">{step > num ? <CheckCircle2 size={16} /> : num}</div>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="wizard-card glass-card">
        {/* Step 1: Reference Source */}
        {step === 1 && (
          <div className="wizard-step">
            <h2 className="step-title">Choose Your Reference</h2>
            <p className="step-desc">Select the design source to compare against</p>

            <div className="ref-type-grid">
              <RefTypeButton
                icon={<Upload size={24} />}
                label="Upload Image"
                desc="PNG, JPG, or WebP"
                active={referenceType === "image"}
                onClick={() => setReferenceType("image")}
              />
              <RefTypeButton
                icon={<Link2 size={24} />}
                label="Website URL"
                desc="Any live website"
                active={referenceType === "url"}
                onClick={() => setReferenceType("url")}
              />
              <RefTypeButton
                icon={<PenTool size={24} />}
                label="Figma Link"
                desc="Figma design file"
                active={referenceType === "figma"}
                onClick={() => setReferenceType("figma")}
              />
            </div>

            {referenceType === "image" && (
              <div className="upload-zone"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("dragover"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("dragover")}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("dragover");
                  const file = e.dataTransfer.files[0];
                  if (file) setReferenceFile(file);
                }}>
                {referenceFile ? (
                  <div className="upload-preview">
                    <CheckCircle2 size={24} style={{ color: "var(--success)" }} />
                    <span>{referenceFile.name}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setReferenceFile(null)}>
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={36} style={{ color: "var(--text-muted)" }} />
                    <p>Drag & drop your design image here</p>
                    <label className="btn btn-secondary btn-sm">
                      Browse Files
                      <input type="file" accept="image/*" hidden onChange={(e) => {
                        if (e.target.files?.[0]) setReferenceFile(e.target.files[0]);
                      }} />
                    </label>
                  </>
                )}
              </div>
            )}

            {referenceType === "url" && (
              <input
                type="url" className="input" placeholder="https://example.com"
                value={referenceSource} onChange={(e) => setReferenceSource(e.target.value)}
                style={{ marginTop: 20 }}
              />
            )}

            {referenceType === "figma" && (
              <input
                type="url" className="input" placeholder="https://www.figma.com/design/..."
                value={referenceSource} onChange={(e) => setReferenceSource(e.target.value)}
                style={{ marginTop: 20 }}
              />
            )}
          </div>
        )}

        {/* Step 2: Dev URL */}
        {step === 2 && (
          <div className="wizard-step">
            <h2 className="step-title">Enter Development URL</h2>
            <p className="step-desc">The live website to compare against your reference</p>
            <input
              type="url" className="input" placeholder="https://dev.yoursite.com"
              value={devUrl} onChange={(e) => setDevUrl(e.target.value)}
              style={{ marginTop: 16 }}
            />
            <div style={{ marginTop: 20 }}>
              <label className="form-label">Project Name (optional)</label>
              <input
                type="text" className="input" placeholder="e.g., Homepage Redesign"
                value={projectName} onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Viewports */}
        {step === 3 && (
          <div className="wizard-step">
            <h2 className="step-title">Select Viewports</h2>
            <p className="step-desc">Choose which screen sizes to compare</p>
            <div className="viewport-grid">
              {BREAKPOINTS.map((bp, i) => {
                const Icon = bp.icon;
                const isSelected = selectedViewports.includes(i);
                return (
                  <button
                    key={i}
                    className={`viewport-btn glass-card ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleViewport(i)}
                  >
                    <Icon size={28} />
                    <span className="vp-label">{bp.label}</span>
                    <span className="vp-size">{bp.width} × {bp.height}</span>
                    {isSelected && <CheckCircle2 size={16} className="vp-check" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Options */}
        {step === 4 && (
          <div className="wizard-step">
            <h2 className="step-title">Comparison Options</h2>
            <p className="step-desc">Configure additional analysis features</p>

            <div className="option-cards">
              <div className={`option-card glass-card ${fullPageScan ? "active" : ""}`}
                onClick={() => setFullPageScan(!fullPageScan)}>
                <div className="option-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                  <Monitor size={24} />
                </div>
                <div>
                  <h3>Full Page Scan</h3>
                  <p>{fullPageScan ? "Captures and diffs the entire scrolling height of the page" : "Viewport only. Faster and avoids shifting layout false-positives"}</p>
                </div>
                <div className={`option-toggle ${fullPageScan ? "on" : ""}`}>
                  <div className="toggle-dot" />
                </div>
              </div>

              <div className={`option-card glass-card ${enableTypography ? "active" : ""}`}
                onClick={() => setEnableTypography(!enableTypography)}>
                <div className="option-icon" style={{ background: "rgba(6, 182, 212, 0.1)", color: "#06b6d4" }}>
                  <Type size={24} />
                </div>
                <div>
                  <h3>Typography Analysis</h3>
                  <p>Compare font family, size, weight, line height, and color</p>
                </div>
                <div className={`option-toggle ${enableTypography ? "on" : ""}`}>
                  <div className="toggle-dot" />
                </div>
              </div>

              <div className={`option-card glass-card ${enableAI ? "active" : ""}`}
                onClick={() => setEnableAI(!enableAI)}>
                <div className="option-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3>AI Bug Detection</h3>
                  <p>GPT-4o Vision analyzes spacing, alignment, and layout issues</p>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Requires OpenAI API key in settings</span>
                </div>
                <div className={`option-toggle ${enableAI ? "on" : ""}`}>
                  <div className="toggle-dot" />
                </div>
              </div>
            </div>

            {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}
          </div>
        )}

        {/* Navigation */}
        <div className="wizard-nav">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && referenceType === "url" && !referenceSource) ||
                (step === 1 && referenceType === "figma" && !referenceSource) ||
                (step === 1 && referenceType === "image" && !referenceFile) ||
                (step === 2 && !devUrl) ||
                (step === 3 && selectedViewports.length === 0)
              }>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader2 size={18} className="spin" /> Processing...</> : <>Start Comparison <Sparkles size={16} /></>}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-header { margin-bottom: 24px; }
        .page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .page-subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
        .wizard-progress { display: flex; gap: 8px; margin-bottom: 24px; }
        .progress-step { display: flex; align-items: center; gap: 8px; flex: 1; }
        .step-dot {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--bg-tertiary); border: 2px solid var(--border-primary);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: var(--text-muted);
          transition: all var(--transition-fast);
        }
        .progress-step.active .step-dot { border-color: var(--accent-primary); color: var(--accent-primary-hover); }
        .progress-step.current .step-dot { background: var(--accent-primary); color: white; border-color: var(--accent-primary); }
        .step-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .progress-step.active .step-label { color: var(--text-secondary); }
        .wizard-card { padding: 36px; }
        .wizard-step { min-height: 300px; }
        .step-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .step-desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
        .ref-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .upload-zone {
          margin-top: 20px; padding: 48px; border: 2px dashed var(--border-primary);
          border-radius: var(--radius-lg); text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          transition: border-color var(--transition-fast);
          color: var(--text-secondary); font-size: 14px;
        }
        .upload-zone.dragover { border-color: var(--accent-primary); background: rgba(99, 102, 241, 0.05); }
        .upload-preview { display: flex; align-items: center; gap: 12px; }
        .viewport-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 8px; }
        .viewport-btn {
          padding: 20px; text-align: center; cursor: pointer; border: none;
          font-family: inherit; color: var(--text-secondary);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          position: relative;
        }
        .viewport-btn.selected { border-color: var(--accent-primary) !important; color: var(--accent-primary-hover); }
        .vp-label { font-size: 13px; font-weight: 600; }
        .vp-size { font-size: 11px; color: var(--text-muted); }
        .option-cards { display: flex; flex-direction: column; gap: 12px; }
        .option-card {
          padding: 20px; display: flex; align-items: center; gap: 16px;
          cursor: pointer; user-select: none;
        }
        .option-card.active { border-color: var(--accent-primary) !important; }
        .option-icon {
          width: 48px; height: 48px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .option-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
        .option-card p { font-size: 13px; color: var(--text-secondary); }
        .option-toggle {
          width: 44px; height: 24px; border-radius: 12px; background: var(--bg-tertiary);
          border: 1px solid var(--border-primary); margin-left: auto; flex-shrink: 0;
          position: relative; transition: background var(--transition-fast);
        }
        .option-toggle.on { background: var(--accent-primary); border-color: var(--accent-primary); }
        .toggle-dot {
          width: 18px; height: 18px; border-radius: 50%; background: white;
          position: absolute; top: 2px; left: 2px;
          transition: transform var(--transition-fast);
        }
        .option-toggle.on .toggle-dot { transform: translateX(20px); }
        .wizard-nav {
          display: flex; align-items: center; gap: 12px;
          margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border-primary);
        }
        .spin { animation: spin 1s linear infinite; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
        .auth-error { padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-md); color: #fca5a5; font-size: 13px; }
        @media (max-width: 768px) {
          .ref-type-grid { grid-template-columns: 1fr; }
          .step-label { display: none; }
        }
      `}</style>
    </div>
  );
}

function RefTypeButton({
  icon, label, desc, active, onClick,
}: {
  icon: React.ReactNode; label: string; desc: string; active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`glass-card`}
      onClick={onClick}
      style={{
        padding: "24px", textAlign: "center", cursor: "pointer",
        border: "none", fontFamily: "inherit",
        borderColor: active ? "var(--accent-primary)" : undefined,
        background: active ? "rgba(99, 102, 241, 0.08)" : "var(--bg-glass)",
        color: active ? "var(--accent-primary-hover)" : "var(--text-secondary)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        borderWidth: 1, borderStyle: "solid",
      }}
    >
      {icon}
      <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</span>
    </button>
  );
}
