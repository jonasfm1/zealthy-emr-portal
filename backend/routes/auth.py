from flask import Blueprint, request, jsonify
from models import Patient

# Define Blueprint for authentication routes
auth_bp = Blueprint('auth', __name__)


# POST route to handle patient login
@auth_bp.route('/api/login', methods=['POST'])
def login():
    # Extract email and password from request payload
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    # Find patient by email in the database
    patient = Patient.query.filter_by(email=email).first()

    # Validate credentials
    if not patient or patient.password != password:
        return jsonify({'error': 'Credenciais inválidas'}), 401

    # Return successful authentication response with patient details
    return jsonify({
        'message': 'Login realizado com sucesso',
        'patient': patient.to_dict()
    }), 200
