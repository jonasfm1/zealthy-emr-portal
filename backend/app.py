from flask import Flask
from flask_cors import CORS
from config import Config
from models import db

# Import route blueprints
from routes.auth import auth_bp
from routes.patients import patients_bp
from routes.appointments import appointments_bp
from routes.prescriptions import prescriptions_bp

# Initialize Flask application
app = Flask(__name__)
app.config.from_object(Config)


# Health check / root route
@app.route('/')
def index():
    return {"status": "API online", "message": "Backend do Mini EMR rodando com sucesso!"}


# Enable CORS for Next.js frontend requests on all /api/* routes
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize SQLAlchemy database instance with Flask app
db.init_app(app)

# Register route blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(patients_bp)
app.register_blueprint(appointments_bp)
app.register_blueprint(prescriptions_bp)

# Application entry point
if __name__ == '__main__':
    with app.app_context():
        # Create database tables if they do not exist
        db.create_all()

    # Run development server on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
