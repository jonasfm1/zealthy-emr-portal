'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNavbar from '@/components/AdminNavbar';
import { Patient } from '@/types';

export default function AdminDashboard() {
  // State for storing the list of patients fetched from backend
  const [patients, setPatients] = useState<Patient[]>([]);
  // State for search/filter term
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for creating a new patient record
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    phone: ''
  });

  // Fetch registered patients from Flask backend when component mounts
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/patients')
      .then((res) => {
        if (!res.ok) throw new Error('Error fetching patients');
        return res.json();
      })
      .then((data: Patient[]) => setPatients(data))
      .catch((err) => console.error('Request error:', err));
  }, []);

  // Filter patients based on search input matching name or email
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Submit handler to post new patient data to the backend API
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPatient)
      });

      if (!response.ok) {
        throw new Error('Failed to register patient');
      }

      const createdPatient: Patient = await response.json();
      
      // Update local state list with newly created patient returned by database
      setPatients((prev) => [...prev, createdPatient]);
      setNewPatient({ name: '', email: '', password: '', dob: '', phone: '' });

      // Programmatically click close button on Bootstrap modal
      const closeButton = document.querySelector('#newPatientModal .btn-close') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }

      // Cleanup leftover Bootstrap backdrop elements and styles
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach((backdrop) => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 150);

    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient. Please check if the backend is running.');
    }
  };

  return (
    <>
      <AdminNavbar />
      
      <main className="container my-4">
        {/* Page Header and Add New Patient Trigger Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark m-0">Patient Management</h2>
            <p className="text-muted small m-0">View and manage medical records and patient data.</p>
          </div>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            data-bs-toggle="modal" 
            data-bs-target="#newPatientModal"
          >
            <i className="bi bi-person-plus-fill"></i>
            New Patient
          </button>
        </div>

        {/* Patients Table Container Card */}
        <div className="card border-0 shadow-sm">
          {/* Search Input Bar */}
          <div className="card-header bg-white py-3">
            <div className="row g-2 align-items-center">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Patients List Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>DOB</th>
                  <th>Phone</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="fw-bold text-secondary">#{patient.id}</td>
                    <td className="fw-semibold">{patient.name}</td>
                    <td className="text-muted">{patient.email}</td>
                    <td>{patient.dob}</td>
                    <td>{patient.phone}</td>
                    <td className="text-end">
                      <Link 
                        href={`/admin/patients/${patient.id}`} 
                        className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                      >
                        <i className="bi bi-folder2-open"></i> Record
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Component: Create New Patient */}
        <div className="modal fade" id="newPatientModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Register New Patient</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleCreatePatient}>
                <div className="modal-body d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      required
                      autoComplete="username"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label fw-semibold">Password (for Portal login)</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      required
                      autoComplete="new-password"
                      value={newPatient.password}
                      onChange={(e) => setNewPatient({...newPatient, password: e.target.value})}
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold">DOB</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        required 
                        value={newPatient.dob}
                        onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required 
                        placeholder="555-0100"
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Patient</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}