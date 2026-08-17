'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PortalNavbar from '@/components/PortalNavbar';

// API base URL definition
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AppointmentsPage() {
  const router = useRouter();
  
  // State for holding projected appointments list
  const [appointments, setAppointments] = useState<any[]>([]);
  // State for loading state UI indicator
  const [loading, setLoading] = useState(true);

  // Effect to authenticate patient from localStorage and fetch 90-day projected appointments
  useEffect(() => {
    const stored = localStorage.getItem('patient');
    if (!stored) {
      router.push('/');
      return;
    }
    const patient = JSON.parse(stored);

    // Fetch projected appointments for the logged-in patient
    fetch(`${API_BASE_URL}/patients/${patient.id}/appointments?projection=true&days=90`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      {/* Portal Top Navigation Bar */}
      <PortalNavbar />

      <main className="container my-4">
        {/* Page Header and Back Link */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark m-0">My Appointment Schedule</h2>
            <p className="text-muted small m-0">Projection of your upcoming appointments for the next 3 months.</p>
          </div>
          <Link href="/portal" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Back to Overview
          </Link>
        </div>

        {/* Appointments Table Card */}
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date & Time</th>
                  <th>Provider</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                {/* Conditional Rendering for Loading, Empty, and Data States */}
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-4 text-muted">Loading appointments...</td></tr>
                ) : appointments.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4 text-muted">No appointments scheduled for the next 3 months.</td></tr>
                ) : (
                  appointments.map((appt, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold">{new Date(appt.appointment_date).toLocaleString('en-US')}</td>
                      <td>{appt.provider_name}</td>
                      <td><span className="badge bg-info text-dark text-capitalize">{appt.repeat_schedule}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}