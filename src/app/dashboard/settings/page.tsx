"use client";

import { useState, useEffect } from "react";
import { User, Key, Sparkles, PenTool, Save, Loader2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  
  const [hasFigmaToken, setHasFigmaToken] = useState(false);
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setHasFigmaToken(data.user.hasFigmaToken);
          setHasOpenaiKey(data.user.hasOpenaiKey);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    const updateData: any = { name };
    if (figmaToken) updateData.figmaToken = figmaToken;
    if (openaiKey) updateData.openaiKey = openaiKey;

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setSaved(true);
        if (figmaToken) setHasFigmaToken(true);
        if (openaiKey) setHasOpenaiKey(true);
        setFigmaToken("");
        setOpenaiKey("");
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Save failed", error);
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <Loader2 className="spin" size={24} style={{ color: "var(--accent-primary)" }} />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and API integrations</p>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="glass-card settings-section">
          <div className="section-header">
            <User size={20} className="section-icon" />
            <h2>Profile</h2>
          </div>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="input" 
              value={email} 
              disabled 
              style={{ opacity: 0.7, cursor: "not-allowed" }}
            />
            <p className="help-text">Email cannot be changed.</p>
          </div>
        </div>

        {/* Integrations */}
        <div className="glass-card settings-section">
          <div className="section-header">
            <Key size={20} className="section-icon" />
            <h2>Integrations</h2>
          </div>
          
          <div className="integration-card">
            <div className="integration-header">
              <div className="integration-icon" style={{ color: "#ec4899", background: "rgba(236,72,153,0.1)" }}>
                <PenTool size={20} />
              </div>
              <div>
                <h3>Figma API Token</h3>
                <p>Required to extract designs directly from Figma.</p>
              </div>
              {hasFigmaToken && !figmaToken && (
                <div className="status-badge connected"><CheckCircle2 size={12} /> Connected</div>
              )}
            </div>
            <input 
              type="password" 
              className="input" 
              placeholder={hasFigmaToken ? "•••••••••••••••• (Set new token to override)" : "figd_..."}
              value={figmaToken} 
              onChange={(e) => setFigmaToken(e.target.value)} 
            />
          </div>

          <div className="integration-card">
            <div className="integration-header">
              <div className="integration-icon" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3>OpenAI API Key</h3>
                <p>Required for AI cosmetic bug detection (GPT-4o Vision).</p>
              </div>
              {hasOpenaiKey && !openaiKey && (
                <div className="status-badge connected"><CheckCircle2 size={12} /> Connected</div>
              )}
            </div>
            <input 
              type="password" 
              className="input" 
              placeholder={hasOpenaiKey ? "•••••••••••••••• (Set new key to override)" : "sk-..."}
              value={openaiKey} 
              onChange={(e) => setOpenaiKey(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="settings-actions">
        {saved && <span className="save-success"><CheckCircle2 size={16} /> Saved successfully</span>}
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <style jsx>{`
        .page-header { margin-bottom: 32px; }
        .page-title { font-size: 28px; font-weight: 800; }
        .page-subtitle { color: var(--text-secondary); }
        .settings-grid { display: flex; flex-direction: column; gap: 24px; max-width: 800px; margin-bottom: 24px; }
        .settings-section { padding: 32px; }
        .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .section-header h2 { font-size: 18px; font-weight: 700; }
        .section-icon { color: var(--accent-primary); }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
        .help-text { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
        .integration-card { padding: 20px; border: 1px solid var(--border-primary); border-radius: var(--radius-md); margin-bottom: 16px; background: rgba(0,0,0,0.2); }
        .integration-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
        .integration-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
        .integration-header h3 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .integration-header p { font-size: 13px; color: var(--text-muted); }
        .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; margin-left: auto; }
        .status-badge.connected { background: rgba(34,197,94,0.1); color: var(--success); border: 1px solid rgba(34,197,94,0.2); }
        .settings-actions { max-width: 800px; display: flex; justify-content: flex-end; align-items: center; gap: 16px; padding-top: 24px; border-top: 1px solid var(--border-primary); }
        .save-success { color: var(--success); display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
