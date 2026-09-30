import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-skill-jobs-secret-key-2026-prod-ready')

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')

ALLOWED_HOSTS = [h.strip() for h in os.getenv('ALLOWED_HOSTS', '*').split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Apps
    'corsheaders',
    'rest_framework',

    # Skill Jobs Custom Apps
    'accounts.apps.AccountsConfig',
    'api_core.apps.ApiCoreConfig',
    'ambassadors.apps.AmbassadorsConfig',
    'nfc.apps.NfcConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'skilljobs_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'skilljobs_backend.wsgi.application'
ASGI_APPLICATION = 'skilljobs_backend.asgi.application'

# Database Setup with resilient PostgreSQL detection and SQLite fallback
DATABASE_URL = os.getenv('DATABASE_URL')

def check_postgres_connection(db_config):
    """Test if PostgreSQL is reachable, otherwise allow safe local fallback."""
    try:
        import psycopg
        conn_str = f"host={db_config.get('HOST', '127.0.0.1')} port={db_config.get('PORT', '5432')} user={db_config.get('USER', 'postgres')} password={db_config.get('PASSWORD', '')} dbname={db_config.get('NAME', 'skilljobs_db')} connect_timeout=3"
        with psycopg.connect(conn_str) as conn:
            pass
        return True
    except Exception:
        return False

if DATABASE_URL:
    parsed_db = dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    if 'postgresql' in parsed_db.get('ENGINE', '') and DEBUG:
        if check_postgres_connection(parsed_db):
            DATABASES = {'default': parsed_db}
        else:
            print("[NOTICE] PostgreSQL not reachable at DATABASE_URL. Using SQLite local fallback.")
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': BASE_DIR / 'db.sqlite3',
                }
            }
    else:
        DATABASES = {'default': parsed_db}
else:
    DB_NAME = os.getenv('DB_NAME', 'skilljobs_db')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
    DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
    DB_PORT = os.getenv('DB_PORT', '5432')
    
    postgres_config = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
    }
    
    if check_postgres_connection(postgres_config):
        DATABASES = {'default': postgres_config}
    else:
        print("[NOTICE] Local PostgreSQL not reachable. Using SQLite fallback for development.")
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }

AUTH_USER_MODEL = 'accounts.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'UNAUTHENTICATED_USER': None,
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True').lower() in ('true', '1', 't')
raw_origins = os.getenv('ALLOWED_ORIGINS', '')
if raw_origins:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in raw_origins.split(',') if o.strip()]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ['*']
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']

# Prevent 301 redirects on trailing slashes for React API compatibility
APPEND_SLASH = False

# Maximum payload upload size for large media and video uploads (100 MB)
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600
FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000

