import React from 'react';
import Navbar from '../components/Navbar';
import LoginForm from '../components/LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="ws-page-wrapper">
      <Navbar />
      <main className="ws-auth-page-container">
        <LoginForm initialRole="admin" />
      </main>
    </div>
  );
}
