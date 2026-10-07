import os
import sys

# Ensure server_django is in python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
DJANGO_DIR = os.path.join(ROOT_DIR, 'server_django')

if DJANGO_DIR not in sys.path:
    sys.path.insert(0, DJANGO_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skilljobs_backend.settings')

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
