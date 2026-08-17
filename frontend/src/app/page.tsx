'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// API base URL definition
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('mark@some-email-provider.net');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Authentication submit handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store logged-in patient data in localStorage
      localStorage.setItem('patient', JSON.stringify(data.patient));
      router.push('/portal');
    } catch (err) {
      setError('Connection error with the server. Please check if Flask is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: '420px', width: '100%' }}>
        {/* Header Section */}
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '48px', height: '48px' }}>
            <i className="bi bi-person-circle fs-3"></i>
          </div>
          <h3 className="fw-bold text-dark m-0">Patient Portal</h3>
          <p className="text-muted small m-0 mt-1">Access your appointments and prescriptions</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="alert alert-danger py-2 small mb-3" role="alert">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label fw-semibold small">Email</label>
            <input 
              type="email" 
              className="form-control" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label fw-semibold small">Password</label>
            <input 
              type="password" 
              className="form-control" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Footer Admin Link */}
        <div className="mt-4 pt-3 border-top text-center">
          <span className="text-muted small">Are you a healthcare provider? </span>
          <Link href="/admin" className="small fw-semibold text-primary text-decoration-none">
            Access Mini-EMR (Admin)
          </Link>
        </div>
      </div>
    </div>
  );
}