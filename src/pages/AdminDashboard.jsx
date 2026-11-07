import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardCards from '../components/DashboardCards';
import {
  getUsers,
  deleteUser,
  getRecentSearches,
  getAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  getMetrics,
  DEFAULT_ADMIN,
  BACKUP_ADMIN,
} from '../services/storageService';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // Modal for user details
  const [userToDelete, setUserToDelete] = useState(null); // Confirmation modal
  const [recentSearches, setRecentSearches] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [metrics, setMetrics] = useState({ totalSearches: 0 });

  // Announcement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Notification Toast
  const [feedback, setFeedback] = useState(null);

  const refreshAdminData = () => {
    setUsers(getUsers());
    setRecentSearches(getRecentSearches());
    setAnnouncements(getAnnouncements());
    setMetrics(getMetrics());
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  const showNotification = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    );
  });

  // Handle Delete User
  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    // Protection rule: Never allow deleting predefined admin
    const emailLower = userToDelete.email.toLowerCase();
    if (
      emailLower === DEFAULT_ADMIN.email.toLowerCase() ||
      emailLower === BACKUP_ADMIN.email.toLowerCase()
    ) {
      showNotification('The Master Administrator account is protected and cannot be deleted.', 'error');
      setUserToDelete(null);
      return;
    }

    const updated = deleteUser(userToDelete.id);
    setUsers(updated);
    showNotification(`User "${userToDelete.name}" (${userToDelete.email}) was deleted successfully.`);
    setUserToDelete(null);
  };

  // Handle Add Announcement
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showNotification('Please enter both title and advisory content.', 'error');
      return;
    }

    addAnnouncement({ title: newTitle, content: newContent });
    setNewTitle('');
    setNewContent('');
    setAnnouncements(getAnnouncements());
    showNotification('Campus Weather Advisory published successfully.');
  };

  // Handle Delete Announcement
  const handleDeleteAnn = (id) => {
    const updated = deleteAnnouncement(id);
    setAnnouncements(updated);
    showNotification('Advisory announcement removed.');
  };

  return (
    <div className="ws-page-wrapper">
      <Navbar />

      <div className="ws-dashboard-layout">
        <Sidebar />

        <main className="ws-main-content">
          {/* Header Banner */}
          <div className="ws-admin-header ws-glass">
            <div>
              <div className="ws-admin-badge">System Administrator Portal</div>
              <h2 className="ws-admin-title">SDC Weather Sense Control Center</h2>
              <p className="ws-admin-desc">
                Review registered student users, inspect real-time query metrics, and publish campus advisories.
              </p>
            </div>
            <div className="ws-admin-chip">
              <span className="ws-chip-dot"></span>
              <span>Live Database Mode</span>
            </div>
          </div>

          {/* Toast Notification */}
          {feedback && (
            <div className={`ws-alert ${feedback.type === 'error' ? 'ws-alert-danger' : 'ws-alert-success'}`}>
              <span className="ws-alert-icon">{feedback.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Dashboard Metrics Cards */}
          <DashboardCards
            totalUsers={users.length}
            totalSearches={metrics.totalSearches || recentSearches.length}
            favoriteCount={4}
            systemStatus="Operational"
          />

          {/* Section: Registered Users Management */}
          <section className="ws-admin-section ws-glass">
            <div className="ws-section-header">
              <div>
                <h3 className="ws-section-heading">Registered Student Accounts</h3>
                <p className="ws-section-sub">
                  Total {users.length} registered accounts in Browser Local Storage
                </p>
              </div>

              {/* User search bar */}
              <div className="ws-table-search">
                <span className="ws-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Filter users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="ws-input-sm"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="ws-table-container">
              <table className="ws-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Registration Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="ws-table-empty">
                        No registered users found matching "{userSearch}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="ws-table-user">
                            <span className="ws-user-avatar-sm">
                              {(u.name ? u.name[0] : 'U').toUpperCase()}
                            </span>
                            <span className="ws-user-name-bold">{u.name || 'Unnamed'}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span
                            className={`ws-badge ${u.role === 'admin' ? 'ws-badge-admin' : 'ws-badge-user'}`}
                          >
                            {u.role === 'admin' ? 'Administrator' : 'Student / User'}
                          </span>
                        </td>
                        <td>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Pre-seeded'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="ws-btn ws-btn-sm ws-btn-secondary"
                            onClick={() => setSelectedUser(u)}
                            style={{ marginRight: '6px' }}
                          >
                            Details
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              className="ws-btn ws-btn-sm ws-btn-danger"
                              onClick={() => setUserToDelete(u)}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section: Recently Searched Cities Analytics & Campus Advisories Grid */}
          <div className="ws-admin-two-col">
            {/* Recent Searches Analytics */}
            <section className="ws-admin-section ws-glass">
              <h3 className="ws-section-heading">Recent Search Analytics</h3>
              <p className="ws-section-sub">Live city queries tracked across all user sessions</p>

              {recentSearches.length === 0 ? (
                <p className="ws-muted ws-mt-md">No queries recorded yet.</p>
              ) : (
                <div className="ws-recent-list ws-mt-md">
                  {recentSearches.map((s, idx) => {
                    const cityName = typeof s === 'string' ? s : s.city;
                    const country = typeof s === 'object' ? s.country : '';
                    const time =
                      typeof s === 'object' && s.timestamp
                        ? new Date(s.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent';

                    return (
                      <div key={idx} className="ws-recent-item">
                        <div className="ws-recent-city-block">
                          <span className="ws-pin">📍</span>
                          <div>
                            <strong>{cityName}</strong>
                            {country && <span className="ws-muted-country">, {country}</span>}
                          </div>
                        </div>
                        <span className="ws-recent-time-badge">{time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Campus Weather Advisories / Announcements Manager */}
            <section className="ws-admin-section ws-glass">
              <h3 className="ws-section-heading">Campus Advisories</h3>
              <p className="ws-section-sub">Publish weather bulletins for student dashboards</p>

              <form onSubmit={handleAddAnnouncement} className="ws-ann-form ws-mt-md">
                <input
                  type="text"
                  placeholder="Advisory Title (e.g. Thunderstorm Watch)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="ws-input-sm"
                  required
                />
                <textarea
                  placeholder="Detailed student advisory message..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="ws-textarea-sm"
                  rows={2}
                  required
                />
                <button type="submit" className="ws-btn ws-btn-primary ws-btn-sm">
                  Publish Advisory
                </button>
              </form>

              <div className="ws-ann-list ws-mt-md">
                {announcements.map((a) => (
                  <div key={a.id} className="ws-ann-item">
                    <div className="ws-ann-meta">
                      <strong>{a.title}</strong>
                      <button
                        type="button"
                        className="ws-ann-del"
                        onClick={() => handleDeleteAnn(a.id)}
                        title="Delete announcement"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="ws-ann-body">{a.content}</p>
                    <span className="ws-ann-date">{a.date}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="ws-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="ws-modal ws-glass" onClick={(e) => e.stopPropagation()}>
            <div className="ws-modal-header">
              <h3 className="ws-modal-title">Student Profile Details</h3>
              <button
                type="button"
                className="ws-modal-close"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>
            <div className="ws-modal-body">
              <div className="ws-modal-avatar">
                {(selectedUser.name ? selectedUser.name[0] : 'U').toUpperCase()}
              </div>
              <h4 className="ws-modal-username">{selectedUser.name}</h4>
              <span className={`ws-badge ${selectedUser.role === 'admin' ? 'ws-badge-admin' : 'ws-badge-user'}`}>
                {selectedUser.role === 'admin' ? 'Administrator' : 'Student / User'}
              </span>

              <div className="ws-modal-fields ws-mt-md">
                <div className="ws-detail-row">
                  <span className="ws-detail-label">Email:</span>
                  <span className="ws-detail-value">{selectedUser.email}</span>
                </div>
                <div className="ws-detail-row">
                  <span className="ws-detail-label">User ID:</span>
                  <span className="ws-detail-value"><code>{selectedUser.id}</code></span>
                </div>
                <div className="ws-detail-row">
                  <span className="ws-detail-label">Phone:</span>
                  <span className="ws-detail-value">{selectedUser.phone || 'Not provided'}</span>
                </div>
                <div className="ws-detail-row">
                  <span className="ws-detail-label">Bio / Major:</span>
                  <span className="ws-detail-value">{selectedUser.bio || 'B.Tech Student'}</span>
                </div>
                <div className="ws-detail-row">
                  <span className="ws-detail-label">Account Created:</span>
                  <span className="ws-detail-value">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleString()
                      : 'Pre-seeded demo user'}
                  </span>
                </div>
              </div>
            </div>
            <div className="ws-modal-footer">
              <button
                type="button"
                className="ws-btn ws-btn-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="ws-modal-backdrop" onClick={() => setUserToDelete(null)}>
          <div className="ws-modal ws-glass" onClick={(e) => e.stopPropagation()}>
            <div className="ws-modal-header">
              <h3 className="ws-modal-title">Confirm Account Deletion</h3>
              <button
                type="button"
                className="ws-modal-close"
                onClick={() => setUserToDelete(null)}
              >
                ✕
              </button>
            </div>
            <div className="ws-modal-body">
              <p>
                Are you sure you want to permanently delete user account for{' '}
                <strong>{userToDelete.name}</strong> ({userToDelete.email})?
              </p>
              <p className="ws-muted ws-mt-sm">
                This record will be removed from browser Local Storage. This action cannot be undone.
              </p>
            </div>
            <div className="ws-modal-footer">
              <button
                type="button"
                className="ws-btn ws-btn-secondary"
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ws-btn ws-btn-danger"
                onClick={handleConfirmDelete}
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
