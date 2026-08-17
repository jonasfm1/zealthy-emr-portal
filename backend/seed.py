import json
import os
import requests
from app import app
from models import db, Patient, Appointment, Prescription


# Function to seed the database with initial patient, appointment, and prescription data
def seed_database():
    with app.app_context():
        # URL source for raw JSON data
        json_url = "https://gist.githubusercontent.com/sbraford/73f63d75bb995b6597754c1707e40cc2/raw/50c5792ad4867be5d09b7bc6542e7dabc448b0dc/data.json"
        base_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(base_dir, 'data.json')

        # Try reading data from local JSON file; fall back to fetching from remote URL
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            print("Downloading data directly from the URL...")
            response = requests.get(json_url)
            data = response.json()

        # Extract users array from seed data
        users = data.get('users', [])
        print(f"Total users found: {len(users)}")

        # Clear existing records to avoid primary key conflicts
        Prescription.query.delete()
        Appointment.query.delete()
        Patient.query.delete()
        db.session.commit()

        # Iterate through users list and populate database tables
        for u in users:
            # Create patient record
            patient = Patient(
                id=u.get('id'),
                name=u.get('name'),
                email=u.get('email'),
                password=u.get('password', '123456'),
                dob="1990-01-01",
                phone="0000000000"
            )
            db.session.add(patient)
            print(f"  -> Patient added: {u.get('name')}")

            # Insert patient's appointments
            for appt in u.get('appointments', []):
                appointment = Appointment(
                    id=appt.get('id'),
                    patient_id=u.get('id'),
                    provider_name=appt.get('provider'),
                    first_appointment=appt.get('datetime'),
                    repeat_schedule=appt.get('repeat', 'none')
                )
                db.session.add(appointment)

            # Insert patient's prescriptions
            for rx in u.get('prescriptions', []):
                prescription = Prescription(
                    id=rx.get('id'),
                    patient_id=u.get('id'),
                    medication_name=rx.get('medication'),
                    dosage=rx.get('dosage'),
                    quantity=rx.get('quantity'),
                    refill_date=rx.get('refill_on'),
                    refill_schedule=rx.get('refill_schedule', 'monthly')
                )
                db.session.add(prescription)

        # Commit all new entries to database
        db.session.commit()
        print("✅ Database successfully populated!")


# Execute seed script when run as main module
if __name__ == '__main__':
    seed_database()
