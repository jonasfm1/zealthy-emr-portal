from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from models import db, Appointment

# Define Blueprint for appointment routes
appointments_bp = Blueprint('appointments', __name__)


# Helper function to project future recurring appointments up to a given number of days
def generate_recurring_appointments(appt, days_ahead=90):
    occurrences = []

    # Parse initial appointment date
    try:
        start_dt = datetime.fromisoformat(
            appt.first_appointment).replace(tzinfo=None)
    except (ValueError, TypeError):
        return [appt.to_dict()]

    # Set projection time limit
    limit_dt = datetime.now().replace(tzinfo=None) + timedelta(days=days_ahead)

    # Parse optional end date for recurring schedule
    end_dt = None
    if appt.end_date:
        try:
            end_dt = datetime.fromisoformat(appt.end_date).replace(tzinfo=None)
        except (ValueError, TypeError):
            end_dt = None

    # Generate dates based on recurrence schedule
    current_dt = start_dt
    while current_dt <= limit_dt:
        if end_dt and current_dt > end_dt:
            break

        occurrences.append({
            'id': appt.id,
            'patient_id': appt.patient_id,
            'provider_name': appt.provider_name,
            'appointment_date': current_dt.strftime('%Y-%m-%dT%H:%M:%S'),
            'repeat_schedule': appt.repeat_schedule
        })

        # Calculate next occurrence date
        if appt.repeat_schedule == 'weekly':
            current_dt += timedelta(days=7)
        elif appt.repeat_schedule == 'biweekly':
            current_dt += timedelta(days=14)
        elif appt.repeat_schedule == 'monthly':
            current_dt += timedelta(days=30)
        else:
            break

    return occurrences


# GET route to fetch all appointments for a specific patient (with optional projection)
@appointments_bp.route('/api/patients/<int:patient_id>/appointments', methods=['GET'])
def get_patient_appointments(patient_id):
    projection = request.args.get('projection', 'false').lower() == 'true'
    days = int(request.args.get('days', 90))

    # Fetch patient appointments from database
    appointments = Appointment.query.filter_by(patient_id=patient_id).all()

    # Return raw appointments if projection is not requested
    if not projection:
        return jsonify([a.to_dict() for a in appointments]), 200

    # Generate projected occurrences for recurring appointments
    projected_list = []
    for appt in appointments:
        projected_list.extend(
            generate_recurring_appointments(appt, days_ahead=days))

    # Sort results chronologically
    projected_list.sort(key=lambda x: x['appointment_date'])
    return jsonify(projected_list), 200


# POST route to create a new appointment
@appointments_bp.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json() or {}
    new_appt = Appointment(
        patient_id=data.get('patient_id'),
        provider_name=data.get('provider_name'),
        first_appointment=data.get('first_appointment'),
        repeat_schedule=data.get('repeat_schedule', 'none'),
        end_date=data.get('end_date')
    )
    db.session.add(new_appt)
    db.session.commit()
    return jsonify(new_appt.to_dict()), 201


# PUT route to update an existing appointment by ID
@appointments_bp.route('/api/appointments/<int:appt_id>', methods=['PUT'])
def update_appointment(appt_id):
    appt = Appointment.query.get_or_404(appt_id)
    data = request.get_json() or {}

    # Update appointment attributes
    appt.provider_name = data.get('provider_name', appt.provider_name)
    appt.first_appointment = data.get(
        'first_appointment', appt.first_appointment)
    appt.repeat_schedule = data.get('repeat_schedule', appt.repeat_schedule)
    appt.end_date = data.get('end_date', appt.end_date)

    db.session.commit()
    return jsonify(appt.to_dict()), 200


# DELETE route to remove an appointment by ID
@appointments_bp.route('/api/appointments/<int:appt_id>', methods=['DELETE'])
def delete_appointment(appt_id):
    appt = Appointment.query.get_or_404(appt_id)
    db.session.delete(appt)
    db.session.commit()
    return jsonify({'message': 'Agendamento removido'}), 200
