'use client';

import { useEffect, useState } from 'react';

interface EmailRecord {
  Email: string;
  Subject: string;
  Body: string;
  Status: string;
  'Sent at': string;
  Error: string;
}

interface EmailData {
  emails: EmailRecord[];
  stats: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  lastUpdated: string;
}

export default function Dashboard() {
  const [data, setData] = useState<EmailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails');

      if (!response.ok) {
        throw new Error('Failed to fetch email data');
      }

      const result = await response.json();
      setData(result);
      setError(null);
      setLastRefresh(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '—';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return '✓';
      case 'failed':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '•';
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📧</div>
            <h1>Email Automation</h1>
          </div>
          <div className="header-actions">
            <button id="refreshBtn" className="btn-refresh" onClick={fetchData} title="Refresh data">
              <span className="refresh-icon">↻</span>
              Refresh
            </button>
            <div className="last-updated">
              Last updated: <span id="lastUpdated">{lastRefresh || 'Never'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className="stats-section">
        <div className="stats-grid">
          <StatCard
            icon="📊"
            label="Total Emails"
            value={data?.stats.total || 0}
            color="total"
          />
          <StatCard
            icon="✓"
            label="Sent"
            value={data?.stats.sent || 0}
            color="sent"
          />
          <StatCard
            icon="✗"
            label="Failed"
            value={data?.stats.failed || 0}
            color="failed"
          />
          <StatCard
            icon="⏳"
            label="Pending"
            value={data?.stats.pending || 0}
            color="pending"
          />
        </div>
      </section>

      {/* Recent Emails Table */}
      <section className="table-section">
        <div className="section-header">
          <h2>Recent Emails</h2>
          <div className="section-subtitle">Latest email activity from your automation system</div>
        </div>

        <div className="table-container">
          <table className="emails-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Sent At</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row">
                  <td colSpan={5}>
                    <div className="loading">
                      <div className="spinner"></div>
                      <span>Loading email data...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr className="error-row">
                  <td colSpan={5}>
                    <div className="error-state">
                      <div className="error-icon">⚠️</div>
                      <div className="error-text">
                        Failed to load email data. Please check your Sheet ID and ensure the sheet is publicly accessible.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : !data || data.emails.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <div>No emails found. Add emails to your Google Sheet to get started.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                [...data.emails].reverse().map((email, index) => (
                  <tr key={index}>
                    <td>{email.Email}</td>
                    <td>{email.Subject}</td>
                    <td>
                      <span
                        className={`status-badge ${email.Status.toLowerCase()}`}
                      >
                        <span className="status-icon">{getStatusIcon(email.Status)}</span>
                        {email.Status}
                      </span>
                    </td>
                    <td>{formatDateTime(email['Sent at'])}</td>
                    <td>
                      {email.Error ? (
                        <span className="error-text" title={email.Error}>
                          {email.Error}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color: 'total' | 'sent' | 'failed' | 'pending';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}
