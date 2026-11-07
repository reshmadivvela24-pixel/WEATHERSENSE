import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { currentUser, isAdmin, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: 'error', text: 'Full Name is required.' });
      return;
    }

    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
    });

    setFeedback({ type: 'success', text: 'Profile details updated successfully!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="ws-page-wrapper">
      <Navbar />

      <div className="ws-dashboard-layout">
        <Sidebar />

        <main className="ws-main-content">
          <div className="ws-admin-header ws-glass">
            <div>
              <div className="ws-badge ws-badge-info">User Profile</div>
              <h2 className="ws-admin-title">Account Settings & Information</h2>
              <p className="ws-admin-desc">Manage your personal student details and preferences</p>
            </div>
          </div>

          {feedback && (
            <div
              className={`ws-alert ws-mt-md ${feedback.type === 'error' ? 'ws-alert-danger' : 'ws-alert-success'}`}
            >
              <span className="ws-alert-icon">{feedback.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="ws-profile-container ws-mt-lg">
            {/* Left Card: Summary */}
            <div className="ws-profile-summary-card ws-glass">
              <div className="ws-profile-avatar-large">
                {(name ? name[0] : 'U').toUpperCase()}
              </div>
              <h3 className="ws-profile-name">{name || 'Student User'}</h3>
              <span className="ws-profile-email">{currentUser?.email}</span>

              <div className="ws-mt-md">
                <span className={`ws-badge ${isAdmin ? 'ws-badge-admin' : 'ws-badge-user'}`}>
                  {isAdmin ? 'Administrator' : 'Student / User'}
                </span>
              </div>

              <div className="ws-profile-quick-stats ws-mt-lg">
                <div className="ws-stat-mini">
                  <span className="label">Account Role</span>
                  <strong>{currentUser?.role || 'user'}</strong>
                </div>
                <div className="ws-stat-mini">
                  <span className="label">System ID</span>
                  <code>{currentUser?.id || 'demo-id'}</code>
                </div>
              </div>
            </div>

            {/* Right Card: Edit Form */}
            <div className="ws-profile-edit-card ws-glass">
              <h3 className="ws-section-heading">Update Profile Information</h3>
              <p className="ws-section-sub">Changes will be saved into browser Local Storage.</p>

              <form onSubmit={handleSubmit} className="ws-form ws-mt-md">
                <div className="ws-form-group">
                  <label className="ws-form-label">Full Name</label>
                  <input
                    type="text"
                    className="ws-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="ws-form-group">
                  <label className="ws-form-label">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="ws-input ws-input-disabled"
                    value={currentUser?.email || ''}
                    disabled
                  />
                  <small className="ws-muted">Email is permanent for authentication.</small>
                </div>

                <div className="ws-form-group">
                  <label className="ws-form-label">Phone Number</label>
                  <input
                    type="text"
                    className="ws-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="ws-form-group">
                  <label className="ws-form-label">Bio / Major</label>
                  <textarea
                    className="ws-textarea"
                    rows={3}
                    placeholder="e.g. B.Tech Computer Science 2nd Year, Weather & IoT Enthusiast"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <button type="submit" className="ws-btn ws-btn-primary ws-mt-md">
                  Save Profile Changes
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
