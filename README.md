# Skill Jobs (Next-Gen Career Development Platform)

Full-stack career development ecosystem connecting students, campus ambassadors, and recruiters with interactive workshops, leadership programs, and NFC smart credentials.

---

## 🏗️ Architecture

* **Frontend:** React 19, Vite, React Router v7, Framer Motion, Lucide React (`client/`)
* **Backend:** Python 3, Django 5+, Django REST Framework, Django ORM, django-cors-headers (`server_django/`)
* **Database:** PostgreSQL (with JSONB support and automatic schema migrations)
* **Deployment:** Render (`render.yaml`)

---

## 🚀 Getting Started

### 1. Backend (Django + PostgreSQL)

```bash
cd server_django

# Install dependencies
pip install -r requirements.txt

# Run migrations to create PostgreSQL tables
python manage.py migrate

# Seed initial default configurations, admin users, and data
python manage.py seed_data

# Start the Django development server
python manage.py runserver 5000
```

* **API Health Check:** `http://localhost:5000/`
* **Django Admin:** `http://localhost:5000/django-admin/`
* **API Endpoints Root:** `http://localhost:5000/api/`

---

### 2. Frontend (React 19 + Vite)

```bash
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

* **Frontend URL:** `http://localhost:5173/`

---

## 🔑 Default Credentials (from `seed_data`)

* **Super Admin:** `admin@skill.jobs` | Password: `admin123`
* **Corporate Admin:** `corporate2@skill.jobs` | Password: `password123`
* **Campus Ambassador:** `auhin.and.aurin@gmail.com` | Password: `password123`