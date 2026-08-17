# Zealthy - Mini-EMR & Patient Portal

This application was developed in response to the **Zealthy** technical test, comprising an administrative **Mini-EMR** and a responsive **Patient Portal**.

## 🚀 Technologies Used

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Bootstrap 5, Bootstrap Icons.
- **Backend**: Python (Flask, Flask-SQLAlchemy, Flask-CORS).
- **Database**: MySQL.

---

## 🛠️ Features

### 1. Mini-EMR (`/admin`)
- General patient listing with search/filter functionality.
- Registration of new patients (CRU).
- Individual patient record (`/admin/patients/[id]`):
  - Editing of patient registration data.
  - Full CRUD for Appointments (Doctor, Initial Date/Time, Recurrence Frequency and End Date).
  - Full CRUD for Prescriptions (Medication, Dosage, Quantity, Refill Date and Frequency).

### 2. Patient Portal (`/`)
- Login screen based on the patient's email and password (`/`).
- Main dashboard (`/portal`):
  - Display of the patient's basic information.
  - Summary of appointments and refills scheduled for the **next 7 days**.
- Detailed appointments view (`/portal/appointments`):
  - Projection of recurring appointments extended for up to **3 months (90 days)**.
- Detailed medications view (`/portal/medications`):
  - Complete list of active prescriptions and refill history.

---

## 🚦 How to Run Locally

### Configuring the Backend (Flask + MySQL)

1. Enter the backend folder:
   ```bash
   cd zealthy-backend
   
2 Create and activate the Python virtual environment:
    python3 -m venv venv
    source venv/bin/activate

3 Install the dependencies:
    pip install -r requirements.txt

4 Create the database in your MySQL:
    CREATE DATABASE zealthy_emr;

5 Run the script to populate the database via data.json:
    python3 seed.py

6 Start the Flask server:
    python3 app.py

### Configuring the Frontend (Next.js)

In the root of the Next.js project, install the dependencies:
    npm install

Run the development environment:
    npm run dev
    (Frontend will run at http://localhost:3000)