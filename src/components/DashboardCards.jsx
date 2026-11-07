import React from 'react';

export default function DashboardCards({
  totalUsers = 0,
  totalSearches = 0,
  favoriteCount = 0,
  systemStatus = 'Online',
}) {
  return (
    <div className="ws-stats-grid">
      <div className="ws-stat-card ws-glass">
        <div className="ws-stat-icon-wrap icon-blue">
          <span>👥</span>
        </div>
        <div className="ws-stat-info">
          <span className="ws-stat-label">Registered Users</span>
          <span className="ws-stat-number">{totalUsers}</span>
          <span className="ws-stat-desc">Active Student Accounts</span>
        </div>
      </div>

      <div className="ws-stat-card ws-glass">
        <div className="ws-stat-icon-wrap icon-purple">
          <span>🔍</span>
        </div>
        <div className="ws-stat-info">
          <span className="ws-stat-label">Weather Queries</span>
          <span className="ws-stat-number">{totalSearches}</span>
          <span className="ws-stat-desc">Live Searches Executed</span>
        </div>
      </div>

      <div className="ws-stat-card ws-glass">
        <div className="ws-stat-icon-wrap icon-amber">
          <span>⭐</span>
        </div>
        <div className="ws-stat-info">
          <span className="ws-stat-label">Favorite Cities</span>
          <span className="ws-stat-number">{favoriteCount}</span>
          <span className="ws-stat-desc">Pinned by Users</span>
        </div>
      </div>

      <div className="ws-stat-card ws-glass">
        <div className="ws-stat-icon-wrap icon-green">
          <span>⚡</span>
        </div>
        <div className="ws-stat-info">
          <span className="ws-stat-label">API Health</span>
          <span className="ws-stat-number status-badge-online">{systemStatus}</span>
          <span className="ws-stat-desc">Open-Meteo Realtime</span>
        </div>
      </div>
    </div>
  );
}
