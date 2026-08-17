'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PortalNavbar from '@/components/PortalNavbar';
import { Patient, Prescription } from '@/types';

// API base URL definition
const API_BASE_URL = 'http://localhost:5000/api';

export default function PortalDashboard() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [upcomingAppts, setUpcomingAppts] = useState<any[]>([]);
  const [upcomingRx, setUpcomingRx] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('patient');
    if (!stored) {
      router.push('/');
      return;
    }

    try {
      const p = JSON.parse(stored);
      const patientId = p.id || p.patient_id;

      if (!patientId) {
        router.push('/');
        return;
      }

      setPatient(p);

      const fetchData = async () => {
        try {
          const [resAppts, resRx] = await Promise.all([
            fetch(`${API_BASE_URL}/patients/${patientId}/appointments?projection=true&days=7`),
            fetch(`${API_BASE_URL}/patients/${patientId}/prescriptions`)
          ]);

          if (resAppts.ok) setUpcomingAppts(await resAppts.json());
          if (resRx.ok) {
            const rxList: Prescription[] = await resRx.json();
            const now = new Date();
            const in7Days = new Date();
            in7Days.setDate(now.getDate() + 7);

            const filteredRx = rxList.filter(rx => {
              const refill = new Date(rx.refill_date);
              return refill >= now && refill <= in7Days;
            });
            setUpcomingRx(filteredRx);
          }
        } catch (err) {
          console.error('Backend connection error:', err);
          setErrorMsg('Could not connect to the server. Please check if Flask is running.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } catch (e) {
      localStorage.removeItem('patient');
      router.push('/');
    }
  }, [router]);

  if (loading) {
    return (
      <>
        <PortalNavbar />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading portal...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PortalNavbar />

      <main className="container my-4">
        {errorMsg && (
          <div className="alert alert-danger py-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
          </div>
        )}

        {/* Welcome Header + Patient Info Card */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm bg-primary text-white h-100 d-flex justify-content-center p-4">
              <h2 className="fw-bold m-0">Hello, {patient?.name}!</h2>
              <p className="m-0 mt-2 text-white-50 fs-5">
                Welcome to your health portal. Check below for a summary of your appointments and medications for the next 7 days.
              </p>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold m-0 text-dark">
                  <i className="bi bi-person-badge text-primary me-2"></i>Your Profile
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-2 small">
                  <div>
                    <span className="text-muted d-block">Email</span>
                    <strong className="text-dark">{patient?.email}</strong>
                  </div>
                  <div>
                    <span className="text-muted d-block">Phone</span>
                    <strong className="text-dark">{patient?.phone}</strong>
                  </div>
                  <div>
                    <span className="text-muted d-block">Date of Birth</span>
                    <strong className="text-dark">{patient?.dob}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Summary Section */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 text-dark">
                  <i className="bi bi-calendar-event text-primary me-2"></i>Appointments in Next 7 Days
                </h5>
                <Link href="/portal/appointments" className="btn btn-outline-primary btn-sm">View All</Link>
              </div>
              <div className="card-body p-3">
                {upcomingAppts.length === 0 ? (
                  <p className="text-muted small m-0 text-center py-3">No appointments scheduled for the next 7 days.</p>
                ) : (
                  upcomingAppts.map((appt, idx) => (
                    <div key={idx} className="p-3 border rounded bg-light mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-dark">{appt.provider_name}</span>
                        <span className="badge bg-warning text-dark text-capitalize">{appt.repeat_schedule}</span>
                      </div>
                      <div className="small text-muted mt-1">
                        <i className="bi bi-clock me-1"></i>
                        {new Date(appt.appointment_date).toLocaleString('en-US')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 text-dark">
                  <i className="bi bi-capsule text-primary me-2"></i>Refills in Next 7 Days
                </h5>
                <Link href="/portal/medications" className="btn btn-outline-primary btn-sm">View All</Link>
              </div>
              <div className="card-body p-3">
                {upcomingRx.length === 0 ? (
                  <p className="text-muted small m-0 text-center py-3">No medication refills scheduled for the next 7 days.</p>
                ) : (
                  upcomingRx.map((rx) => (
                    <div key={rx.id} className="p-3 border rounded bg-light mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-dark">{rx.medication_name}</span>
                        <span className="badge bg-success">Upcoming Refill</span>
                      </div>
                      <div className="small text-muted mt-1">
                        Dose: {rx.dosage} | Qty: {rx.quantity} units | Refill: {rx.refill_date}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}