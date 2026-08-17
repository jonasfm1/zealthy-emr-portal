'use client';

import Link from 'next/link';

// Navigation bar component for the administrative Mini-EMR interface
export default function AdminNavbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        {/* Brand Logo and Admin Badge */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/admin">
          <i className="bi bi-hospital text-primary"></i>
          <span>Zealthy EMR</span>
          <span className="badge bg-primary fs-6 ms-2">Admin</span>
        </Link>

        {/* Shortcut link to Patient Portal */}
        <div className="d-flex align-items-center gap-3">
          <Link href="/" className="btn btn-outline-light btn-sm">
            <i className="bi bi-person-circle me-1"></i> Go to Patient Portal
          </Link>
        </div>
      </div>
    </nav>
  );
}