# 70-30 Intergenerational Knowledge Platform

**70-30** is a social impact platform designed to bridge the gap between generations. We connect senior experts (70+) with younger individuals (30-) who are eager to learn professional trades, craftsmanship, and life skills.

## 🚀 Mission
To provide purpose and occupation for retired seniors while preserving traditional and professional knowledge (carpentry, aviation, farming, craftsmanship, etc.) and empowering the younger generation through mentorship.

## 🛠 Tech Stack

- **Backend**: Django REST Framework (Python)
- **Frontend**: React + Vite
- **Database**: PostgreSQL with PostGIS (Geospatial data)
- **Caching**: Redis
- **Infrastructure**: Docker & Docker Compose

## ⚡️ Quick Start

### Prerequisites
- Docker & Docker Compose installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd 70-30-app
   ```

2. **Run the Application**
   ```bash
   docker compose up --build
   ```

3. **Access Services**
   - **Frontend (React)**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8001/api](http://localhost:8001/api)
   - **API Documentation (Swagger)**: [http://localhost:8001/swagger/](http://localhost:8001/swagger/)
   - **Admin Panel**: [http://localhost:8001/admin/](http://localhost:8001/admin/)

### Default Credentials
- **Superuser**: `admin` / `admin`

### 🔧 Reset Admin Password
If you forget the admin password, you can reset it using the following Docker command:
```bash
docker exec 70-30-grandpa-backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u = User.objects.get(username='admin'); u.set_password('new_password'); u.save();"
```

## 📂 Project Structure

```
70-30-app/
├── ai_agents_docs/       # Detailed project documentation & sprints
├── backend/              # Django Project (grandpa-backend)
├── client/               # React Project (grandpa-client)
├── docker-compose.yml    # Orchestration for all services
└── postgres_data/        # Local DB persistence (ignored in git)
```

## 📚 Documentation
Detailed documentation about the implementation plan, daily logs, and sprint breakdowns can be found in the `ai_agents_docs/` directory.

- [Project Description](ai_agents_docs/project_description.md)
- [Implementation Plan](ai_agents_docs/implementation_plan.md)