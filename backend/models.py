from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy database instance
db = SQLAlchemy()


# Patient database model
class Patient(db.Model):
    __tablename__ = 'patients'

    # Table columns
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    dob = db.Column(db.String(10), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    # Relationships with cascading deletion for associated records
    appointments = db.relationship(
        'Appointment', backref='patient', lazy=True, cascade="all, delete-orphan")
    prescriptions = db.relationship(
        'Prescription', backref='patient', lazy=True, cascade="all, delete-orphan")

    # Serialize model instance to dictionary
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'dob': self.dob,
            'phone': self.phone
        }


# Appointment database model
class Appointment(db.Model):
    __tablename__ = 'appointments'

    # Table columns
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey(
        'patients.id'), nullable=False)
    provider_name = db.Column(db.String(100), nullable=False)
    # ISO Format: YYYY-MM-THH:mm:ss
    first_appointment = db.Column(db.String(30), nullable=False)
    # none, weekly, biweekly, monthly
    repeat_schedule = db.Column(db.String(20), default='none')
    end_date = db.Column(db.String(10), nullable=True)

    # Serialize model instance to dictionary
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'provider_name': self.provider_name,
            'first_appointment': self.first_appointment,
            'repeat_schedule': self.repeat_schedule,
            'end_date': self.end_date
        }


# Prescription database model
class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    # Table columns
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey(
        'patients.id'), nullable=False)
    medication_name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    refill_date = db.Column(db.String(10), nullable=False)         # YYYY-MM-DD
    # monthly, quarterly, none
    refill_schedule = db.Column(db.String(20), default='monthly')

    # Serialize model instance to dictionary
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'medication_name': self.medication_name,
            'dosage': self.dosage,
            'quantity': self.quantity,
            'refill_date': self.refill_date,
            'refill_schedule': self.refill_schedule
        }
