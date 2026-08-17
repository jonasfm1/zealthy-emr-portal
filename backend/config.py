import os


class Config:
    # MySQL Connection URL using the PyMySQL driver
    # Format: mysql+pymysql://user:password@localhost/database_name
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'mysql+pymysql://root:54802836@localhost/zealthy_emr'
    )

    # Disable SQLAlchemy modification tracking to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Secret key for application security and sessions
    SECRET_KEY = os.getenv('SECRET_KEY', 'zealthy-secret-key-123')
