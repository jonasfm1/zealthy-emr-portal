'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PortalNavbar from '@/components/PortalNavbar';
import { Prescription } from '@/types';

// API base URL definition
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function MedicationsPage() {
  const router = useRouter();
  
  // State for holding prescriptions list
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  // State for loading state UI indicator
  const [loading, setLoading] = useState(true);

  // Effect to authenticate patient from localStorage and fetch active prescriptions
  useEffect(() => {
    const stored = localStorage.getItem('patient');
    if (!stored) {
      router.push('/');
      return;
    }
    const patient = JSON.parse(stored);

    // Fetch prescriptions for the logged-in patient
    fetch(`${API_BASE_URL}/patients/${patient.id}/prescriptions`)
      .then(res => res.json())
      .then(data => setPrescriptions(data))
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
            <h2 className="fw-bold text-dark m-0">My Prescriptions & Refills</h2>
            <p className="text-muted small m-0">Track your active medications and upcoming refill dates.</p>
          </div>
          <Link href="/portal" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Back to Overview
          </Link>
        </div>

        {/* Medications Table Card */}
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Next Refill</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                {/* Conditional Rendering for Loading, Empty, and Data States */}
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">Loading medications...</td></tr>
                ) : prescriptions.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No active prescriptions found.</td></tr>
                ) : (
                  prescriptions.map((rx) => (
                    <tr key={rx.id}>
                      <td className="fw-semibold">{rx.medication_name}</td>
                      <td>{rx.dosage}</td>
                      <td>{rx.quantity} pills</td>
                      <td>{rx.refill_date}</td>
                      <td><span className="badge bg-primary text-capitalize">{rx.refill_schedule}</span></td>
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