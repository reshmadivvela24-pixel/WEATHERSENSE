import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFoundPage() {
  return (
    <div className="ws-page-wrapper">
      <Navbar />
      <main className="ws-not-found-container">
        <div className="ws-not-found-card ws-glass">
          <div className="ws-404-badge">404 Error</div>
          <h1 className="ws-404-title">Page Not Found</h1>
          <p className="ws-404-desc">
            The meteorological observation route you requested does not exist or has been moved.
          </p>
          <div className="ws-404-actions">
            <Link to="/dashboard" className="ws-btn ws-btn-primary">
              Return to Weather Dashboard
            </Link>
            <Link to="/" className="ws-btn ws-btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
