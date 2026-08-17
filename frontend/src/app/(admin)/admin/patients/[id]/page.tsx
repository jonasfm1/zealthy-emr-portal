'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import { Patient, Appointment, Prescription } from '@/types';

// API base endpoint definition
const API_BASE_URL = 'https://zealthy-emr-portal.onrender.com/api';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id;

  // Main state variables for patient data and records
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for editing existing records
  const [editingPatient, setEditingPatient] = useState<Patient>({
    id: 0, name: '', email: '', dob: '', phone: ''
  });

  const [editingAppt, setEditingAppt] = useState<Appointment>({
    id: 0, patient_id: Number(patientId), provider_name: '', first_appointment: '', repeat_schedule: 'none', end_date: ''
  });

  const [editingRx, setEditingRx] = useState<Prescription>({
    id: 0, patient_id: Number(patientId), medication_name: '', dosage: '', quantity: 1, refill_date: '', refill_schedule: 'monthly'
  });

  // Form states for creating new records
  const [newAppt, setNewAppt] = useState({
    provider_name: '',
    first_appointment: '',
    repeat_schedule: 'none' as Appointment['repeat_schedule'],
    end_date: ''
  });

  const [newRx, setNewRx] = useState({
    medication_name: '',
    dosage: '',
    quantity: 30,
    refill_date: '',
    refill_schedule: 'monthly' as Prescription['refill_schedule']
  });

  // Fetch patient profile, appointments, and prescriptions from backend
  const fetchPatientData = useCallback(async () => {
    try {
      setLoading(true);
      const [resPatient, resAppts, resRx] = await Promise.all([
        fetch(`${API_BASE_URL}/patients/${patientId}`),
        fetch(`${API_BASE_URL}/patients/${patientId}/appointments`),
        fetch(`${API_BASE_URL}/patients/${patientId}/prescriptions`)
      ]);

      if (resPatient.ok) {
        const pData = await resPatient.json();
        setPatient(pData);
        setEditingPatient(pData);
      }
      if (resAppts.ok) setAppointments(await resAppts.json());
      if (resRx.ok) setPrescriptions(await resRx.json());
    } catch (error) {
      console.error('Error loading medical record data:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Execute fetch function when component mounts or patientId changes
  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId, fetchPatientData]);

  // Helper function to close Bootstrap modals and remove leftover backdrop styling
  const closeModal = (modalSelector: string) => {
    const closeBtn = document.querySelector(`${modalSelector} .btn-close`) as HTMLElement;
    if (closeBtn) closeBtn.click();
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }, 150);
  };

  // Handler to update patient profile information
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPatient)
      });
      if (res.ok) {
        setPatient(await res.json());
        closeModal('#editPatientModal');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler to create a new appointment for the patient
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: Number(patientId),
          ...newAppt,
          end_date: newAppt.end_date || null
        })
      });
      if (res.ok) {
        fetchPatientData();
        setNewAppt({ provider_name: '', first_appointment: '', repeat_schedule: 'none', end_date: '' });
        closeModal('#addApptModal');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler to update an existing appointment
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${editingAppt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAppt)
      });
      if (res.ok) {
        fetchPatientData();
        closeModal('#editApptModal');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler to delete an appointment by ID
  const handleDeleteAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to remove this appointment?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPatientData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler to create a new prescription for the patient
  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: Number(patientId),
          ...newRx
        })
      });
      if (res.ok) {
        fetchPatientData();
        setNewRx({ medication_name: '', dosage: '', quantity: 30, refill_date: '', refill_schedule: 'monthly' });
        closeModal('#addRxModal');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler to update an existing prescription
  const handleUpdatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/prescriptions/${editingRx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRx)
      });
      if (res.ok) {
        fetchPatientData();
        closeModal('#editRxModal');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler to delete a prescription by ID
  const handleDeletePrescription = async (id: number) => {
    if (!confirm('Are you sure you want to remove this prescription?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/prescriptions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPatientData();
    } catch (err) {
      console.error(err);
    }
  };

  // Render loading state spinner while fetching initial data
  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading medical record...</p>
        </div>
      </>
    );
  }

  // Render fallback view if patient is not found
  if (!patient) {
    return (
      <>
        <AdminNavbar />
        <div className="container my-5 text-center">
          <h4>Patient not found</h4>
          <Link href="/admin" className="btn btn-primary mt-2">Back to list</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />

      <main className="container my-4">
        {/* Navigation Link back to patients list */}
        <div className="mb-3">
          <Link href="/admin" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
            <i className="bi bi-arrow-left"></i> Back to Patient List
          </Link>
        </div>

        {/* Patient Profile Header Card */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="badge bg-light text-primary border mb-2">Record #{patientId}</span>
                <h3 className="fw-bold text-dark m-0">{patient.name}</h3>
                <p className="text-muted small m-0 mt-1">
                  <i className="bi bi-envelope me-1"></i>{patient.email} | 
                  <i className="bi bi-telephone ms-2 me-1"></i>{patient.phone} | 
                  <i className="bi bi-calendar-event ms-2 me-1"></i>DOB: {patient.dob}
                </p>
              </div>
              <button 
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" 
                data-bs-toggle="modal" 
                data-bs-target="#editPatientModal"
                onClick={() => setEditingPatient(patient)}
              >
                <i className="bi bi-pencil"></i> Edit Details
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Appointments Table Section */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 text-dark">
                  <i className="bi bi-calendar-check text-primary me-2"></i>Appointments & Schedule
                </h5>
                <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" data-bs-toggle="modal" data-bs-target="#addApptModal">
                  <i className="bi bi-plus-circle"></i> New Appointment
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Provider</th>
                        <th>Date/Time</th>
                        <th>Recurrence</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt.id}>
                          <td className="fw-semibold">{appt.provider_name}</td>
                          <td className="small">{new Date(appt.first_appointment).toLocaleString('en-US')}</td>
                          <td>
                            <span className="badge bg-info text-dark text-capitalize">{appt.repeat_schedule}</span>
                          </td>
                          <td className="text-end">
                            <button 
                              className="btn btn-outline-secondary btn-sm border-0 me-1"
                              data-bs-toggle="modal"
                              data-bs-target="#editApptModal"
                              onClick={() => setEditingAppt(appt)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button onClick={() => handleDeleteAppointment(appt.id)} className="btn btn-outline-danger btn-sm border-0">
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-4 text-muted">No appointments scheduled.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Prescriptions Table Section */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 text-dark">
                  <i className="bi bi-capsule text-primary me-2"></i>Prescriptions & Medications
                </h5>
                <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" data-bs-toggle="modal" data-bs-target="#addRxModal">
                  <i className="bi bi-plus-circle"></i> New Prescription
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Medication</th>
                        <th>Dosage / Qty</th>
                        <th>Next Refill</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((rx) => (
                        <tr key={rx.id}>
                          <td className="fw-semibold">{rx.medication_name}</td>
                          <td className="small">{rx.dosage} ({rx.quantity} units)</td>
                          <td className="small">{rx.refill_date}</td>
                          <td className="text-end">
                            <button 
                              className="btn btn-outline-secondary btn-sm border-0 me-1"
                              data-bs-toggle="modal"
                              data-bs-target="#editRxModal"
                              onClick={() => setEditingRx(rx)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button onClick={() => handleDeletePrescription(rx.id)} className="btn btn-outline-danger btn-sm border-0">
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {prescriptions.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-4 text-muted">No active prescriptions.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Component: Edit Patient Details */}
        <div className="modal fade" id="editPatientModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Patient Details</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleUpdatePatient}>
                <div className="modal-body d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold">Full Name</label>
                    <input type="text" className="form-control" required value={editingPatient.name} onChange={(e) => setEditingPatient({...editingPatient, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" className="form-control" required value={editingPatient.email} onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})} />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold">DOB</label>
                      <input type="date" className="form-control" required value={editingPatient.dob} onChange={(e) => setEditingPatient({...editingPatient, dob: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <input type="text" className="form-control" required value={editingPatient.phone} onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Update Patient</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Component: Edit Appointment Details */}
        <div className="modal fade" id="editApptModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Appointment</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleUpdateAppointment}>
                <div className="modal-body d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold">Provider</label>
                    <input type="text" className="form-control" required value={editingAppt.provider_name} onChange={(e) => setEditingAppt({...editingAppt, provider_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Initial Date and Time</label>
                    <input type="datetime-local" className="form-control" required value={editingAppt.first_appointment} onChange={(e) => setEditingAppt({...editingAppt, first_appointment: e.target.value})} />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Recurrence</label>
                      <select className="form-select" value={editingAppt.repeat_schedule} onChange={(e) => setEditingAppt({...editingAppt, repeat_schedule: e.target.value as any})}>
                        <option value="none">None</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">End Date</label>
                      <input type="date" className="form-control" value={editingAppt.end_date || ''} onChange={(e) => setEditingAppt({...editingAppt, end_date: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Component: Edit Prescription Details */}
        <div className="modal fade" id="editRxModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Prescription</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleUpdatePrescription}>
                <div className="modal-body d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold">Medication</label>
                    <input type="text" className="form-control" required value={editingRx.medication_name} onChange={(e) => setEditingRx({...editingRx, medication_name: e.target.value})} />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Dosage</label>
                      <input type="text" className="form-control" required value={editingRx.dosage} onChange={(e) => setEditingRx({...editingRx, dosage: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Quantity</label>
                      <input type="number" className="form-control" required min="1" value={editingRx.quantity} onChange={(e) => setEditingRx({...editingRx, quantity: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Refill Date</label>
                      <input type="date" className="form-control" required value={editingRx.refill_date} onChange={(e) => setEditingRx({...editingRx, refill_date: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Frequency</label>
                      <select className="form-select" value={editingRx.refill_schedule} onChange={(e) => setEditingRx({...editingRx, refill_schedule: e.target.value as any})}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Component: Create New Appointment */}
        <div className="modal fade" id="addApptModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">New Appointment</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleAddAppointment}>
                <div className="modal-body d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold">Provider Name</label>
                    <input type="text" className="form-control" required placeholder="e.g. Dr. Sarah Smith" value={newAppt.provider_name} onChange={(e) => setNewAppt({...newAppt, provider_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Initial Date and Time</label>
                    <input type="datetime-local" className="form-control" required value={newAppt.first_appointment} onChange={(e) => setNewAppt({...newAppt, first_appointment: e.target.value})} />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Recurrence</label>
                      <select className="form-select" value={newAppt.repeat_schedule} onChange={(e) => setNewAppt({...newAppt, repeat_schedule: e.target.value as any})}>
                        <option value="none">None</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">End Date (Optional)</label>
                      <input type="date" className="form-control" value={newAppt.end_date} onChange={(e) => setNewAppt({...newAppt, end_date: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Schedule Appointment</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Component: Create New Prescription */}
        <div className="modal fade" id="addRxModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">New Prescription</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleAddPrescription}>
                <div className="modal-body d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold">Medication Name</label>
                    <input type="text" className="form-control" required placeholder="e.g. Amoxicillin" value={newRx.medication_name} onChange={(e) => setNewRx({...newRx, medication_name: e.target.value})} />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Dosage</label>
                      <input type="text" className="form-control" required placeholder="e.g. 500mg" value={newRx.dosage} onChange={(e) => setNewRx({...newRx, dosage: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Quantity</label>
                      <input type="number" className="form-control" required min="1" value={newRx.quantity} onChange={(e) => setNewRx({...newRx, quantity: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Next Refill Date</label>
                      <input type="date" className="form-control" required value={newRx.refill_date} onChange={(e) => setNewRx({...newRx, refill_date: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Refill Frequency</label>
                      <select className="form-select" value={newRx.refill_schedule} onChange={(e) => setNewRx({...newRx, refill_schedule: e.target.value as any})}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Prescription</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}