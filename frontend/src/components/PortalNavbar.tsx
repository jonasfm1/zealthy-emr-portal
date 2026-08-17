'use client';

import Link from 'next/link';

// Navigation bar component for the Patient Portal interface
export default function PortalNavbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" href="/portal">
          <i className="bi bi-heart-pulse-fill"></i>
          <span>Zealthy Patient Portal</span>
        </Link>

        {/* Navigation Links and Actions */}
        <div className="d-flex align-items-center gap-3">
          <Link href="/portal/appointments" className="btn btn-link text-decoration-none text-dark btn-sm">
            Appointments
          </Link>
          <Link href="/portal/medications" className="btn btn-link text-decoration-none text-dark btn-sm">
            Medications
          </Link>
          <Link href="/admin" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-shield-lock me-1"></i> Admin Area
          </Link>
          <Link href="/" className="btn btn-outline-danger btn-sm">
            Sign Out
          </Link>
        </div>
      </div>
    </nav>
  );
}