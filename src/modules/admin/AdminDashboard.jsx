import React, { useState, useEffect } from 'react';
import {
  getUsers,
  saveUsers,
  getTips,
  addTip,
  deleteTip,
  getAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  getSearchCount,
  getActivityLog,
  clearActivityLog,
  ADMIN_CREDENTIALS,
  logActivity,
} from '../../services/storage';

export default function AdminDashboard({ session, onNavigateUserView }) {
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard', 'users', 'tips', 'announcements', 'activity'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [tips, setTips] = useState([]);
  const [newTipText, setNewTipText] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnText, setNewAnnText] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const [activity, setActivity] = useState([]);

  // Toast / feedback message
  const [toast, setToast] = useState(null);

  // Confirmation modal state
  const [modalConfig, setModalConfig] = useState(null);

  const refreshData = () => {
    setUsers(getUsers());
    setTips(getTips());
    setAnnouncements(getAnnouncements());
    setSearchCount(getSearchCount());
    setActivity(getActivityLog());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // ── User Management ──
  const handleDeleteUser = (userToDelete) => {
    if (userToDelete.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) {
      showToast('The predefined administrator account cannot be deleted.', 'error');
      return;
    }

    setModalConfig({
      title: 'Delete User Account',
      message: `Are you sure you want to delete user account "${userToDelete.name}" (${userToDelete.email})? This action cannot be undone.`,
      onConfirm: () => {
        const updated = users.filter((u) => u.email !== userToDelete.email);
        saveUsers(updated);
        logActivity(`Admin deleted user: ${userToDelete.email}`);
        refreshData();
        showToast(`User account ${userToDelete.email} has been deleted.`);
        setModalConfig(null);
      },
    });
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  // ── Tips Management ──
  const handleAddTip = (e) => {
    e.preventDefault();
    const clean = newTipText.trim();
    if (!clean) return;
    addTip(clean);
    setNewTipText('');
    refreshData();
    showToast('New weather tip added successfully.');
  };

  const handleDeleteTip = (index) => {
    setModalConfig({
      title: 'Delete Weather Tip',
      message: 'Are you sure you want to delete this weather advisory tip?',
      onConfirm: () => {
        deleteTip(index);
        refreshData();
        showToast('Weather tip deleted.');
        setModalConfig(null);
      },
    });
  };

  // ── Announcements Management ──
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    const clean = newAnnText.trim();
    if (!clean) return;
    addAnnouncement(clean);
    setNewAnnText('');
    refreshData();
    showToast('Campus announcement posted.');
  };

  const handleDeleteAnnouncement = (index) => {
    setModalConfig({
      title: 'Delete Announcement',
      message: 'Are you sure you want to remove this campus announcement?',
      onConfirm: () => {
        deleteAnnouncement(index);
        refreshData();
        showToast('Announcement removed.');
        setModalConfig(null);
      },
    });
  };

  // ── Activity Log ──
  const handleClearActivity = () => {
    setModalConfig({
      title: 'Clear Activity Log',
      message: 'Are you sure you want to erase all logged demo activity? This cannot be reversed.',
      onConfirm: () => {
        clearActivityLog();
        refreshData();
        showToast('Activity log cleared.');
        setModalConfig(null);
      },
    });
  };

  return (
    <div className="admin-layout">
      {/* Toast popup */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {modalConfig && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content card">
            <h3>{modalConfig.title}</h3>
            <p>{modalConfig.message}</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setModalConfig(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={modalConfig.onConfirm}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-title">Admin Management</div>
        <nav>
          <button
            className={`sidebar-link ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('dashboard');
              setSidebarOpen(false);
            }}
            type="button"
          >
            <span>📊</span> Dashboard
          </button>
          <button
            className={`sidebar-link ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('users');
              setSidebarOpen(false);
            }}
            type="button"
          >
            <span>👥</span> Users ({users.length})
          </button>
          <button
            className={`sidebar-link ${activeSection === 'tips' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('tips');
              setSidebarOpen(false);
            }}
            type="button"
          >
            <span>💡</span> Weather Tips ({tips.length})
          </button>
          <button
            className={`sidebar-link ${activeSection === 'announcements' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('announcements');
              setSidebarOpen(false);
            }}
            type="button"
          >
            <span>📢</span> Announcements ({announcements.length})
          </button>
          <button
            className={`sidebar-link ${activeSection === 'activity' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('activity');
              setSidebarOpen(false);
            }}
            type="button"
          >
            <span>📋</span> Activity Log
          </button>

          <hr className="section-divider" style={{ margin: 'var(--space-md) 0' }} />

          <button
            className="sidebar-link"
            onClick={onNavigateUserView}
            type="button"
            title="Preview User Weather Dashboard"
          >
            <span>🌤️</span> View User Dashboard
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Mobile Sidebar Toggle Button */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <button
            className="btn btn-secondary btn-sm admin-sidebar-toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
            type="button"
          >
            <span className="material-symbols-outlined">menu</span>
            {sidebarOpen ? 'Close Menu' : 'Admin Menu'}
          </button>
        </div>

        {/* ── Section 1: Dashboard Overview ── */}
        {activeSection === 'dashboard' && (
          <section className="admin-section">
            <div className="section-header">
              <div>
                <h1 className="section-title">📊 Admin Dashboard Overview</h1>
                <p className="section-subtitle">
                  Live system metrics, search analytics, and registered user accounts.
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={onNavigateUserView}
                type="button"
              >
                <span>🌤️</span> Open User Dashboard
              </button>
            </div>

            {/* Metric Stat Cards */}
            <div className="grid grid-3 mb-lg">
              <div className="stat-card">
                <div className="stat-card-icon">👥</div>
                <div className="stat-card-label">Total Users</div>
                <div className="stat-card-value">{users.length}</div>
                <div className="stat-card-sub">Registered accounts in LocalStorage</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">🔍</div>
                <div className="stat-card-label">Weather Searches</div>
                <div className="stat-card-value">{searchCount}</div>
                <div className="stat-card-sub">Real-time weather queries executed</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">💡</div>
                <div className="stat-card-label">Active Tips</div>
                <div className="stat-card-value">{tips.length}</div>
                <div className="stat-card-sub">Condition advisories served to users</div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="card">
              <div className="card-header">
                <h2>Recent System Activity</h2>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveSection('activity')}
                  type="button"
                >
                  View All ({activity.length})
                </button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="activity-list">
                  {activity.length === 0 ? (
                    <div className="activity-item" style={{ padding: 'var(--space-md)' }}>
                      <span className="text-muted">No activity recorded yet.</span>
                    </div>
                  ) : (
                    activity.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="activity-item" style={{ padding: '10px 16px' }}>
                        <div className="activity-dot"></div>
                        <div className="activity-text">{item.message}</div>
                        <div className="activity-time">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Section 2: User Management ── */}
        {activeSection === 'users' && (
          <section className="admin-section">
            <div className="section-header">
              <div>
                <h1 className="section-title">👥 User Management</h1>
                <p className="section-subtitle">
                  Manage registered college accounts. Predefined admin account is protected.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Registered Accounts</h2>
                <input
                  className="form-input"
                  style={{ maxWidth: '280px' }}
                  type="search"
                  placeholder="Filter by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  aria-label="Search users"
                />
              </div>

              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Full Name</th>
                        <th>Email Address</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Predefined Admin row for reference */}
                      <tr style={{ background: 'var(--surface-container-low)' }}>
                        <td>★</td>
                        <td>
                          <strong>{ADMIN_CREDENTIALS.name}</strong>
                        </td>
                        <td>{ADMIN_CREDENTIALS.email}</td>
                        <td>
                          <span className="badge badge-admin">ADMIN (SYSTEM)</span>
                        </td>
                        <td>Default Seed</td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--outline)' }}>
                            Protected
                          </span>
                        </td>
                      </tr>

                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              textAlign: 'center',
                              color: 'var(--outline)',
                              padding: 'var(--space-xl)',
                            }}
                          >
                            {userSearch
                              ? 'No users match your search criteria.'
                              : 'No normal users registered yet.'}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u, idx) => (
                          <tr key={u.email}>
                            <td>{idx + 1}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                              <span className="badge badge-neutral">{u.role || 'user'}</span>
                            </td>
                            <td>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteUser(u)}
                                type="button"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Section 3: Weather Tips ── */}
        {activeSection === 'tips' && (
          <section className="admin-section">
            <div className="section-header">
              <div>
                <h1 className="section-title">💡 Weather Tips Management</h1>
                <p className="section-subtitle">
                  Create and manage weather tips randomly shown to students on their dashboard.
                </p>
              </div>
            </div>

            {/* Add Tip Form Card */}
            <div className="card mb-md">
              <div className="card-header">
                <h2>Add New Weather Tip</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddTip}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-tip-input">
                      Tip Advisory Message
                    </label>
                    <textarea
                      className="form-input"
                      id="new-tip-input"
                      rows={2}
                      placeholder="e.g. 🌧️ Heavy rains expected this afternoon – carry umbrellas to lab blocks."
                      value={newTipText}
                      onChange={(e) => setNewTipText(e.target.value)}
                      required
                    />
                  </div>
                  <button className="btn btn-primary" type="submit">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      add
                    </span>
                    Add Tip to User Portal
                  </button>
                </form>
              </div>
            </div>

            {/* Existing Tips List Card */}
            <div className="card">
              <div className="card-header">
                <h2>Active Weather Tips</h2>
                <span className="badge badge-neutral">{tips.length} tips</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {tips.length === 0 ? (
                  <div className="tip-item">
                    <span className="text-muted" style={{ padding: 'var(--space-md)' }}>
                      No tips created yet.
                    </span>
                  </div>
                ) : (
                  tips.map((tip, idx) => (
                    <div key={idx} className="tip-item">
                      <span className="tip-item-text">{tip}</span>
                      <div className="tip-item-actions">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteTip(idx)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Section 4: Announcements ── */}
        {activeSection === 'announcements' && (
          <section className="admin-section">
            <div className="section-header">
              <div>
                <h1 className="section-title">📢 Campus Announcements</h1>
                <p className="section-subtitle">
                  Post weather advisories and notices highlighted across all student dashboards.
                </p>
              </div>
            </div>

            {/* Post Announcement Card */}
            <div className="card mb-md">
              <div className="card-header">
                <h2>Post New Announcement</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddAnnouncement}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-ann-input">
                      Announcement Text
                    </label>
                    <textarea
                      className="form-input"
                      id="new-ann-input"
                      rows={2}
                      placeholder="e.g. 📢 College Weather Station maintenance scheduled on Friday 3 PM."
                      value={newAnnText}
                      onChange={(e) => setNewAnnText(e.target.value)}
                      required
                    />
                  </div>
                  <button className="btn btn-primary" type="submit">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      campaign
                    </span>
                    Publish Announcement
                  </button>
                </form>
              </div>
            </div>

            {/* Active Announcements Card */}
            <div className="card">
              <div className="card-header">
                <h2>Published Announcements</h2>
                <span className="badge badge-neutral">{announcements.length} active</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {announcements.length === 0 ? (
                  <div className="ann-item">
                    <span className="text-muted" style={{ padding: 'var(--space-md)' }}>
                      No announcements active.
                    </span>
                  </div>
                ) : (
                  announcements.map((ann, idx) => (
                    <div key={idx} className="ann-item">
                      <span className="ann-item-text">{ann}</span>
                      <div className="ann-item-actions">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteAnnouncement(idx)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Section 5: Activity Log ── */}
        {activeSection === 'activity' && (
          <section className="admin-section">
            <div className="section-header">
              <div>
                <h1 className="section-title">📋 System Activity Log</h1>
                <p className="section-subtitle">
                  Chronological event log tracking student logins, weather lookups, and administrative modifications.
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleClearActivity}
                type="button"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  delete_sweep
                </span>
                Clear Log
              </button>
            </div>

            <div className="card">
              <div className="card-body" style={{ padding: 0 }}>
                <div className="activity-list">
                  {activity.length === 0 ? (
                    <div className="activity-item" style={{ padding: 'var(--space-md)' }}>
                      <span className="text-muted">No activity records found.</span>
                    </div>
                  ) : (
                    activity.map((entry, idx) => (
                      <div key={idx} className="activity-item" style={{ padding: '12px 16px' }}>
                        <div className="activity-dot"></div>
                        <div className="activity-text">{entry.message}</div>
                        <div className="activity-time">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
