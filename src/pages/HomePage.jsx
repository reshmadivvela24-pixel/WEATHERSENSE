import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="ws-page-wrapper">
      <Navbar />

      <main className="ws-home-container">
        {/* Hero Section */}
        <section className="ws-hero-section">
          <div className="ws-hero-badge">
            <span className="ws-sparkle">✨</span>
            <span>B.Tech 2nd-Year SDC Project • React + Vite</span>
          </div>

          <h1 className="ws-hero-title">
            Intelligent Live Weather Forecasting with{' '}
            <span className="ws-gradient-text">WEATHER SENSE</span>
          </h1>

          <p className="ws-hero-description">
            A complete, responsive weather forecasting web dashboard powered by React, Vite,
            Open-Meteo API, and Local Storage. Built with dual modules for Students and
            Administrators.
          </p>

          <div className="ws-hero-cta">
            {isAuthenticated ? (
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="ws-btn ws-btn-primary ws-btn-lg">
                Go to {isAdmin ? 'Admin Panel' : 'Weather Dashboard'} →
              </Link>
            ) : (
              <>
                <Link to="/dashboard" className="ws-btn ws-btn-primary ws-btn-lg">
                  Launch Weather Dashboard
                </Link>
                <Link to="/login" className="ws-btn ws-btn-secondary ws-btn-lg">
                  Student Sign In
                </Link>
                <Link to="/admin/login" className="ws-btn ws-btn-outline ws-btn-lg">
                  Admin Portal 🛡️
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Feature Grid */}
        <section className="ws-features-section">
          <h2 className="ws-section-title">Core Application Features</h2>
          <div className="ws-features-grid">
            <div className="ws-feature-card ws-glass">
              <div className="ws-feature-icon">🛰️</div>
              <h3 className="ws-feature-title">Live Open-Meteo API</h3>
              <p className="ws-feature-text">
                Real-time temperature, apparent feels-like, wind speed, atmospheric pressure,
                visibility, and sunrise/sunset times with zero API key dependencies.
              </p>
            </div>

            <div className="ws-feature-card ws-glass">
              <div className="ws-feature-icon">📅</div>
              <h3 className="ws-feature-title">5-Day Forecast</h3>
              <p className="ws-feature-text">
                Comprehensive 5-day daily weather projections including daily maximums, minimums,
                and WMO standard weather code interpretations.
              </p>
            </div>

            <div className="ws-feature-card ws-glass">
              <div className="ws-feature-icon">🛡️</div>
              <h3 className="ws-feature-title">Role-Based Admin Module</h3>
              <p className="ws-feature-text">
                Dedicated management portal for administrators to monitor registered users,
                inspect recent queries, and publish campus advisories.
              </p>
            </div>

            <div className="ws-feature-card ws-glass">
              <div className="ws-feature-icon">💾</div>
              <h3 className="ws-feature-title">Local Storage Persistence</h3>
              <p className="ws-feature-text">
                Persistent authentication, saved favorite cities, user profiles, and recent
                search histories stored reliably in the browser.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Reviewer Credentials Info */}
        <section className="ws-demo-section ws-glass">
          <div className="ws-demo-header">
            <span className="ws-demo-badge">College Project Demonstration Guide</span>
            <h3>Predefined Evaluation Accounts</h3>
          </div>
          <div className="ws-demo-grid">
            <div className="ws-demo-box">
              <div className="ws-demo-title">Administrator Account</div>
              <div className="ws-demo-row">Email: <code>admin@gmail.com</code></div>
              <div className="ws-demo-row">Password: <code>admin123</code></div>
              <div className="ws-demo-badge-role admin">Role: Administrator</div>
            </div>
            <div className="ws-demo-box">
              <div className="ws-demo-title">Pre-seeded Student Account</div>
              <div className="ws-demo-row">Email: <code>aarav@college.edu</code></div>
              <div className="ws-demo-row">Password: <code>password123</code></div>
              <div className="ws-demo-badge-role user">Role: Student / User</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="ws-footer">
        <p>WEATHER SENSE • B.Tech 2nd-Year SDC Project • Developed with React + Vite</p>
      </footer>
    </div>
  );
}
