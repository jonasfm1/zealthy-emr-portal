import os


class Config:
    # MySQL Connection URL using the PyMySQL driver
    # Reads DATABASE_URL from environment variables (used in Render/Aiven) or falls back to local MySQL
    database_url = os.getenv(
        'DATABASE_URL',
        'mysql+pymysql://root:54802836@localhost/zealthy_emr'
    )

    # Automatic correction in case the provider supplies URLs starting with mysql:// instead of mysql+pymysql://
    if database_url and database_url.startswith("mysql://"):
        database_url = database_url.replace("mysql://", "mysql+pymysql://", 1)

    SQLALCHEMY_DATABASE_URI = database_url

    # Disable SQLAlchemy modification tracking to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Secret key for application security and sessions
    SECRET_KEY = os.getenv('SECRET_KEY', 'zealthy-secret-key-123')
