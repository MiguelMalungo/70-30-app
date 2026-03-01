# 70-30 Project Documentation

## 1. Executive Summary
**70-30** is a POC social impact platform designed to bridge the generational employment gap. The core philosophy is to pair highly skilled, retired individuals ("Masters") with young learners ("Apprentices") to provide services to "Clients". 

For example, if a Client needs a room painted, they post the task (or select the category). The platform matches a Master and an Apprentice to perform the task together as a duo. 
Payments are split fairly (e.g., 50% to the platform/fees, 25% to the Master, 25% to the Apprentice). Beyond the gig economy, the platform acts as a social network, allowing Masters and Apprentices to connect, message, rate one another, and transfer knowledge, providing job opportunities at both ends of the age spectrum.

## 2. Quick Start Guide
**How to start the project locally:**

### Prerequisites
- Docker & Docker Compose installed.

### Steps
1. **Clone the repository**:
   ```bash
   git clone <repo_url>
   cd 70-30-app
   ```

2. **Run with Docker Compose**:
   ```bash
   docker compose up --build
   ```

3. **Access the Application**:
   - **Frontend (React)**: [http://localhost:5173](http://localhost:5173)
   - **Backend API (Django)**: [http://localhost:8001](http://localhost:8001)
     - **Swagger Docs**: [http://localhost:8001/swagger/](http://localhost:8001/swagger/)
     - **Admin Panel**: [http://localhost:8001/admin/](http://localhost:8001/admin/)

4. **Default Credentials**:
   - **Superuser**: `admin` / `admin`

## 3. Platform Mission & Vision
- **Mission**: To democratize access to experience-based knowledge.
- **Vision**: A world where professional and artisanal skills are preserved through direct mentorship.

## 4. Technical Architecture

### 4.1 Backend System (`grandpa-backend`)
- **Framework**: Django REST Framework.
- **Database**: PostgreSQL + PostGIS (Container: `grandpa-db`).
- **Cache**: Redis (Container: `grandpa-redis`).

### 4.2 Frontend System (`grandpa-client`)
- **Framework**: React (Vite).
- **Styling**: CSS / Tailwind (TBD).

### 4.3 Development Process
- **Methodology**: Scrum (Weekly Sprints).
- **Documentation**: Handled in `ai_agents_docs/`.

## 5. Core User Roles
1. **Client**: The end-user requesting and paying for services (e.g., event photography, house services, animal care), viewing estimates, and providing prepayments in escrow.
2. **Master**: Senior experts (e.g., retirees) who execute the service and share their knowledge on the job.
3. **Apprentice**: Junior members who learn from the Master while getting paid to assist on the job.
4. **Admin**: Platform moderators ensuring safety, managing categories, and overseeing payments/escrow.
