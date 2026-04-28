"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Array<{
    id: string;
    name: string;
    _count: { comparisons: number };
    updatedAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your visual QA comparisons</p>
        </div>
        <Link href="/dashboard/compare" className="btn btn-primary">
          <PlusCircle size={18} />
          New Comparison
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard icon={<Eye size={22} />} label="Total Comparisons" value="0" color="#6366f1" />
        <StatCard icon={<AlertTriangle size={22} />} label="Bugs Found" value="0" color="#f59e0b" />
        <StatCard icon={<CheckCircle2 size={22} />} label="Reports Generated" value="0" color="#22c55e" />
        <StatCard icon={<TrendingUp size={22} />} label="Avg Mismatch" value="0%" color="#06b6d4" />
      </div>

      {/* Projects */}
      <div className="section-header-row">
        <h2 className="section-title-sm">Your Projects</h2>
        <Link href="/dashboard/compare" className="btn btn-ghost btn-sm">
          Create Project <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state glass-card">
          <FolderOpen size={48} style={{ color: "var(--text-muted)" }} />
          <h3>No projects yet</h3>
          <p>Create your first comparison to get started</p>
          <Link href="/dashboard/compare" className="btn btn-primary">
            <PlusCircle size={16} />
            Start Comparing
          </Link>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="project-card glass-card"
            >
              <div className="project-icon">
                <FolderOpen size={20} />
              </div>
              <h3 className="project-name">{project.name}</h3>
              <div className="project-meta">
                <span>{project._count.comparisons} comparisons</span>
                <span>
                  <Clock size={12} /> {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .page-subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }
        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title-sm { font-size: 18px; font-weight: 700; }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 64px;
          color: var(--text-secondary);
        }
        .empty-state {
          padding: 64px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-state h3 { font-size: 18px; font-weight: 700; }
        .empty-state p { color: var(--text-secondary); font-size: 14px; margin-bottom: 8px; }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .project-card {
          padding: 24px;
          text-decoration: none;
          color: var(--text-primary);
          cursor: pointer;
        }
        .project-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent-primary-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .project-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .project-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .project-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-md)",
            background: `${color}15`,
            border: `1px solid ${color}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
        </div>
      </div>
    </div>
  );
}
