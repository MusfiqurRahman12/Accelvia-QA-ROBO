"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Copy,
  Download,
  Edit3,
  Eye,
  Trash2,
  Plus,
  GripVertical,
  CheckCircle2,
} from "lucide-react";

interface Bug {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  source: string;
  screenshotUrl?: string;
  location?: string;
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/report/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.report) {
          setReport(data.report);
          setTitle(data.report.title);
          const content = data.report.content as { bugs: Bug[]; notes: string };
          setBugs(content.bugs || []);
          setNotes(content.notes || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const saveReport = async () => {
    setSaving(true);
    await fetch(`/api/report/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: { bugs, notes } }),
    });
    setSaving(false);
  };

  const copyReport = () => {
    const reportText = generateReportText();
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateReportText = () => {
    let text = `# ${title}\n\n`;
    text += `**Generated:** ${new Date().toLocaleDateString()}\n`;
    text += `**Total Issues:** ${bugs.length}\n\n`;
    text += `---\n\n`;

    bugs.forEach((bug, i) => {
      text += `## ${i + 1}. ${bug.title}\n\n`;
      text += `- **Severity:** ${bug.severity}\n`;
      text += `- **Category:** ${bug.category}\n`;
      text += `- **Source:** ${bug.source}\n`;
      if (bug.location) text += `- **Location:** ${bug.location}\n`;
      text += `- **Description:** ${bug.description}\n\n`;
    });

    if (notes) {
      text += `---\n\n## Notes\n\n${notes}\n`;
    }

    return text;
  };

  const exportPDF = async () => {
    setExporting(true);
    // Switch to preview mode for the export
    const wasEditMode = editMode;
    if (wasEditMode) setEditMode(false);
    
    // Wait for React to re-render to preview mode
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      
      const element = reportRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f0f13",
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // top margin
      
      // First page
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
      
      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }
      
      const filename = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
    
    if (wasEditMode) setEditMode(true);
    setExporting(false);
  };

  const updateBug = (index: number, field: keyof Bug, value: string) => {
    const updated = [...bugs];
    updated[index] = { ...updated[index], [field]: value } as Bug;
    setBugs(updated);
  };

  const removeBug = (index: number) => {
    setBugs(bugs.filter((_, i) => i !== index));
  };

  const addBug = () => {
    setBugs([...bugs, {
      id: `bug-${Date.now()}`,
      title: "New Issue",
      description: "",
      category: "other",
      severity: "minor",
      source: "manual",
    }]);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 12 }}>
        <div className="spinner" />
        <span style={{ color: "var(--text-secondary)" }}>Loading report...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ textAlign: "center", padding: 64 }}>
        <h2>Report not found</h2>
        <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginTop: 16 }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="report-header">
        <button className="btn btn-ghost" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ flex: 1 }} />
        <div className="report-actions">
          <button className={`btn btn-sm ${editMode ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setEditMode(true)}>
            <Edit3 size={14} /> Edit
          </button>
          <button className={`btn btn-sm ${!editMode ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setEditMode(false)}>
            <Eye size={14} /> Preview
          </button>
          <div style={{ width: 1, height: 24, background: "var(--border-primary)" }} />
          <button className="btn btn-secondary btn-sm" onClick={copyReport}>
            {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={exportPDF} disabled={exporting}>
            <Download size={14} /> {exporting ? "Exporting..." : "Export PDF"}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={saveReport} disabled={saving}>
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="report-container" ref={reportRef}>
        {editMode ? (
          /* Edit Mode */
          <div className="report-editor">
            <input
              type="text" className="report-title-input" value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Report Title"
            />

            <div className="bugs-list">
              <div className="bugs-header">
                <h3>Issues ({bugs.length})</h3>
                <button className="btn btn-ghost btn-sm" onClick={addBug}>
                  <Plus size={14} /> Add Issue
                </button>
              </div>

              {bugs.map((bug, i) => (
                <div key={bug.id} className="bug-card glass-card">
                  <div className="bug-card-header">
                    <GripVertical size={16} style={{ color: "var(--text-muted)", cursor: "grab" }} />
                    <span className="bug-number">#{i + 1}</span>
                    <select
                      className="severity-select"
                      value={bug.severity}
                      onChange={(e) => updateBug(i, "severity", e.target.value)}
                    >
                      <option value="critical">Critical</option>
                      <option value="major">Major</option>
                      <option value="minor">Minor</option>
                    </select>
                    <select
                      className="category-select"
                      value={bug.category}
                      onChange={(e) => updateBug(i, "category", e.target.value)}
                    >
                      <option value="visual-diff">Visual Diff</option>
                      <option value="typography">Typography</option>
                      <option value="spacing">Spacing</option>
                      <option value="alignment">Alignment</option>
                      <option value="color">Color</option>
                      <option value="overflow">Overflow</option>
                      <option value="layout">Layout</option>
                      <option value="other">Other</option>
                    </select>
                    <div style={{ flex: 1 }} />
                    <button className="btn btn-ghost btn-sm" onClick={() => removeBug(i)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text" className="input" value={bug.title}
                    onChange={(e) => updateBug(i, "title", e.target.value)}
                    placeholder="Bug title"
                    style={{ marginBottom: 8 }}
                  />
                  <textarea
                    className="input" value={bug.description}
                    onChange={(e) => updateBug(i, "description", e.target.value)}
                    placeholder="Describe the issue..."
                    rows={2}
                    style={{ resize: "vertical", marginBottom: 8 }}
                  />
                  {bug.location && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 4, display: "inline-block" }}>
                      {bug.location}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <label className="form-label">Additional Notes</label>
              <textarea
                className="input" value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes, context, or instructions..."
                rows={4}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="report-preview glass-card">
            <h1 className="preview-title">{title}</h1>
            <div className="preview-meta">
              <span>Generated: {new Date().toLocaleDateString()}</span>
              <span>Total Issues: {bugs.length}</span>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid var(--border-primary)", margin: "24px 0" }} />

            {bugs.map((bug, i) => (
              <div key={bug.id} className="preview-bug">
                <div className="preview-bug-header">
                  <span className="preview-bug-num">#{i + 1}</span>
                  <h3>{bug.title}</h3>
                  <span className={`severity-badge severity-${bug.severity}`}>{bug.severity}</span>
                </div>
                <div className="preview-bug-meta">
                  <span>Category: {bug.category}</span>
                  <span>Source: {bug.source}</span>
                  {bug.location && <span>Location: {bug.location}</span>}
                </div>
                <p className="preview-bug-desc">{bug.description}</p>
              </div>
            ))}

            {notes && (
              <>
                <hr style={{ border: "none", borderTop: "1px solid var(--border-primary)", margin: "24px 0" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Notes</h2>
                <p style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{notes}</p>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .report-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .report-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .report-container { max-width: 900px; }
        .report-title-input {
          width: 100%; font-size: 28px; font-weight: 800; background: none;
          border: none; border-bottom: 2px solid var(--border-primary); color: var(--text-primary);
          padding: 8px 0; margin-bottom: 24px; outline: none; font-family: inherit;
        }
        .report-title-input:focus { border-color: var(--accent-primary); }
        .bugs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .bugs-header h3 { font-size: 16px; font-weight: 700; }
        .bug-card { padding: 16px; margin-bottom: 12px; }
        .bug-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .bug-number { font-size: 12px; font-weight: 700; color: var(--text-muted); }
        .severity-select, .category-select {
          padding: 4px 8px; background: var(--bg-tertiary); border: 1px solid var(--border-primary);
          border-radius: var(--radius-sm); color: var(--text-primary); font-size: 12px;
          font-family: inherit; cursor: pointer;
        }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
        .report-preview { padding: 48px; }
        .preview-title { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
        .preview-meta { display: flex; gap: 24px; color: var(--text-muted); font-size: 13px; }
        .preview-bug { margin-bottom: 24px; }
        .preview-bug-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .preview-bug-num { font-size: 12px; font-weight: 700; color: var(--accent-primary-hover); }
        .preview-bug-header h3 { font-size: 16px; font-weight: 700; flex: 1; }
        .severity-badge { padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .preview-bug-meta { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
        .preview-bug-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
      `}</style>
    </div>
  );
}
