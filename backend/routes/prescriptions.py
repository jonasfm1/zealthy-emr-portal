from flask import Blueprint, request, jsonify
from models import db, Prescription

# Define Blueprint for prescription management routes
prescriptions_bp = Blueprint('prescriptions', __name__)


# GET route to fetch all prescriptions for a specific patient
@prescriptions_bp.route('/api/patients/<int:patient_id>/prescriptions', methods=['GET'])
def get_patient_prescriptions(patient_id):
    prescriptions = Prescription.query.filter_by(patient_id=patient_id).all()
    return jsonify([p.to_dict() for p in prescriptions]), 200


# POST route to create a new prescription
@prescriptions_bp.route('/api/prescriptions', methods=['POST'])
def create_prescription():
    data = request.get_json() or {}

    # Instantiate new prescription record
    new_rx = Prescription(
        patient_id=data.get('patient_id'),
        medication_name=data.get('medication_name'),
        dosage=data.get('dosage'),
        quantity=data.get('quantity'),
        refill_date=data.get('refill_date'),
        refill_schedule=data.get('refill_schedule', 'monthly')
    )

    # Save new prescription to database
    db.session.add(new_rx)
    db.session.commit()
    return jsonify(new_rx.to_dict()), 201


# PUT route to update an existing prescription by ID
@prescriptions_bp.route('/api/prescriptions/<int:rx_id>', methods=['PUT'])
def update_prescription(rx_id):
    rx = Prescription.query.get_or_404(rx_id)
    data = request.get_json() or {}

    # Update prescription fields if provided
    rx.medication_name = data.get('medication_name', rx.medication_name)
    rx.dosage = data.get('dosage', rx.dosage)
    rx.quantity = data.get('quantity', rx.quantity)
    rx.refill_date = data.get('refill_date', rx.refill_date)
    rx.refill_schedule = data.get('refill_schedule', rx.refill_schedule)

    db.session.commit()
    return jsonify(rx.to_dict()), 200


# DELETE route to remove a prescription by ID
@prescriptions_bp.route('/api/prescriptions/<int:rx_id>', methods=['DELETE'])
def delete_prescription(rx_id):
    rx = Prescription.query.get_or_404(rx_id)
    db.session.delete(rx)
    db.session.commit()
    return jsonify({'message': 'Prescrição removida'}), 200
