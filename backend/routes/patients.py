from flask import Blueprint, request, jsonify
from models import db, Patient

# Define Blueprint for patient management routes
patients_bp = Blueprint('patients', __name__)


# GET route to fetch all registered patients
@patients_bp.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()
    return jsonify([p.to_dict() for p in patients]), 200


# GET route to fetch a single patient by ID
@patients_bp.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    return jsonify(patient.to_dict()), 200


# POST route to register a new patient
@patients_bp.route('/api/patients', methods=['POST'])
def create_patient():
    data = request.get_json() or {}

    # Check if email is already registered in database
    if Patient.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email já cadastrado'}), 400

    # Instantiate new patient object
    new_patient = Patient(
        name=data.get('name'),
        email=data.get('email'),
        password=data.get('password'),
        dob=data.get('dob'),
        phone=data.get('phone')
    )

    # Save new patient to database
    db.session.add(new_patient)
    db.session.commit()

    return jsonify(new_patient.to_dict()), 201


# PUT route to update an existing patient profile by ID
@patients_bp.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    data = request.get_json() or {}

    # Update patient fields if provided
    patient.name = data.get('name', patient.name)
    patient.email = data.get('email', patient.email)
    patient.dob = data.get('dob', patient.dob)
    patient.phone = data.get('phone', patient.phone)

    db.session.commit()
    return jsonify(patient.to_dict()), 200
