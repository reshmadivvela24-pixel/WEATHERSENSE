import React from 'react';
import Navbar from '../components/Navbar';
import SignupForm from '../components/SignupForm';

export default function SignupPage() {
  return (
    <div className="ws-page-wrapper">
      <Navbar />
      <main className="ws-auth-page-container">
        <SignupForm />
      </main>
    </div>
  );
}
