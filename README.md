# Employee Management System

A production-ready containerized MERN stack application featuring:
*   **React Frontend (Vite + TypeScript)** with a beautiful, fully functional dashboard using Tailwind CSS and Lucide icons.
*   **Node.js Express Backend API** with full CRUD routing and a custom `/health` endpoint.
*   **MongoDB Database** configured with data volumes for safe persistence.
*   **Jenkins CI/CD Pipeline Configuration** (`Jenkinsfile`) for automated parallel test executions, Docker image creation/pushing, SSH-based remote EC2 updates, health verification checkups, and notifications.

## Project Setup

### Local Run (Docker Compose)
To run the entire application environment locally:
```bash
docker compose up --build
```
*   **Frontend Web UI**: http://localhost
*   **Backend REST API**: http://localhost:8080
*   **MongoDB Instance**: localhost:27017

### Directory Structure
```text
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```
