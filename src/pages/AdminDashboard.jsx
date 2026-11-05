import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  getUsers,
  saveUsers,
  getCurrentUser,
  DEFAULT_ADMIN,
  BACKUP_ADMIN_EMAIL,
  getStoredItem,
  setStoredItem,
  STORAGE_KEYS,
} from '../utils/storage';

export default function AdminDashboard({ onLogout }) {
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // For "View Details" modal
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null); // For "Delete" modal
  const [feedback, setFeedback] = useState(null);
  const [searchCount, setSearchCount] = useState(0);

  // Load registered users and search metrics on mount
  useEffect(() => {
    refreshUsers();
    const count = getStoredItem(STORAGE_KEYS.SEARCH_COUNT, 0);
    setSearchCount(count);
  }, []);

  const refreshUsers = () => {
    const list = getUsers();
    setUsers(list);
  };

  const showNotification = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Filter users by search term
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (!deleteConfirmUser) return;

    // Check if trying to delete default admin
    const emailLower = deleteConfirmUser.email.toLowerCase();
    if (
      emailLower === DEFAULT_ADMIN.email.toLowerCase() ||
      emailLower === BACKUP_ADMIN_EMAIL.toLowerCase()
    ) {
      showNotification('The predefined Administrator account cannot be deleted.', 'error');
      setDeleteConfirmUser(null);
      return;
    }

    const updated = users.filter((u) => u.id !== deleteConfirmUser.id);
    saveUsers(updated);
    setUsers(updated);
    showNotification(`User account for "${deleteConfirmUser.name}" has been deleted.`);
    setDeleteConfirmUser(null);
  };

  return (
    <div className="app-page">
      <Navbar user={currentUser} onLogout={onLogout} />

      <main className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-2xl)' }}>
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}
            style={{ marginBottom: 'var(--space-lg)' }}
          >
            <span className="material-symbols-outlined alert-icon">
              {feedback.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">📊 Administrator Control Panel</h1>
            <p className="section-subtitle">
              Manage student accounts, view system analytics, and supervise registered users.
            </p>
          </div>
          <div>
            <span className="badge badge-admin">Logged in: {currentUser?.email}</span>
          </div>
        </div>

        {/* Dashboard Metric Statistics Cards */}
        <div className="grid grid-3 mb-lg">
          <div className="stat-card">
            <div className="stat-card-icon">👥</div>
            <div className="stat-card-label">Registered Users</div>
            <div className="stat-card-value">{users.length}</div>
            <div className="stat-card-sub">Student & faculty accounts in Local Storage</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">🔍</div>
            <div className="stat-card-label">Total Weather Searches</div>
            <div className="stat-card-value">{searchCount}</div>
            <div className="stat-card-sub">Open-Meteo API queries executed</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">🛡️</div>
            <div className="stat-card-label">Admin Privileges</div>
            <div className="stat-card-value">ACTIVE</div>
            <div className="stat-card-sub">Full user deletion & supervision rights</div>
          </div>
        </div>

        {/* User Management Table Card */}
        <section className="card">
          <div className="card-header">
            <h2>👥 Registered User Accounts ({users.length})</h2>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <input
                className="form-input"
                style={{ maxWidth: '280px' }}
                type="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search users"
              />
            </div>
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
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Predefined System Administrator Row */}
                  <tr style={{ backgroundColor: 'var(--surface-container-low)' }}>
                    <td>★</td>
                    <td>
                      <strong>{DEFAULT_ADMIN.name}</strong>
                    </td>
                    <td>{DEFAULT_ADMIN.email}</td>
                    <td>
                      <span className="badge badge-admin">ADMINISTRATOR</span>
                    </td>
                    <td>Default System Account</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedUser(DEFAULT_ADMIN)}
                        type="button"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>

                  {/* Registered Users Rows */}
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
                        {searchTerm
                          ? 'No users match your search query.'
                          : 'No regular users registered yet. Register a new user on the Signup page.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr key={user.id || user.email}>
                        <td>{idx + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className="badge badge-neutral">{user.role || 'user'}</span>
                        </td>
                        <td>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'Registered'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedUser(user)}
                              type="button"
                            >
                              View Details
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteConfirmUser(user)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Modal: View User Details */}
        {selectedUser && (
          <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content card">
              <h3>User Account Details</h3>
              <div style={{ margin: 'var(--space-md) 0', fontSize: '14px', lineHeight: '1.8' }}>
                <div>
                  <strong>Account ID:</strong> {selectedUser.id || 'N/A'}
                </div>
                <div>
                  <strong>Full Name:</strong> {selectedUser.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedUser.email}
                </div>
                <div>
                  <strong>Assigned Role:</strong>{' '}
                  <span className={selectedUser.role === 'admin' ? 'badge badge-admin' : 'badge badge-info'}>
                    {selectedUser.role?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <strong>Registered On:</strong>{' '}
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'Permanent Admin'}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedUser(null)}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete User */}
        {deleteConfirmUser && (
          <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content card">
              <h3>Confirm User Deletion</h3>
              <p>
                Are you sure you want to permanently delete the account for{' '}
                <strong>{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})?
              </p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirmUser(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDelete} type="button">
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
