# Triage - Mutation Testing Analysis Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/deployment-docker-2496ED.svg?logo=docker&logoColor=white)
![Status](https://img.shields.io/badge/status-active-success.svg)

**Triage** is a three-tier web application developed for the "Praxis der Softwareentwicklung" (PSE) course at KIT. It addresses the signal-to-noise ratio problem in mutation testing by providing a centralized platform to ingest, analyze, and prioritize mutants for manual review.

## 🏗 Architecture

The system utilizes a strict three-tier architecture fully containerized for easy deployment:

*   **Frontend (Tier 1):** Built with **React** (Vite), utilizing TanStack Router for navigation and Tailwind CSS/Radix UI for a responsive interface.
*   **Backend (Tier 2):** Powered by **Python FastAPI**, handling data processing and logic.
*   **Database (Tier 3):** **PostgreSQL** ensures relational integrity, storing projects, mutants, and user reviews.

## 🚀 Getting Started

These instructions will get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### Installation & Deployment

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/PSE-TRIAGE/triage.git
    cd triage
    ```

2.  **Environment Configuration:**
    Copy the example environment file to create your production configuration.
    ```bash
    cp .env.example .env
    ```

    Open the `.env` file and configure the necessary values:

    ```ini
    # Database Configuration
    DB_PASSWORD=your_super_secure_root_password
    APP_DB_PASSWORD=your_triage_backend_password
    
    # Backend Configuration
    ENVIRONMENT=production
    
    # Frontend Configuration
    HTTP_PORT=80
    HTTPS_PORT=443
    DOMAIN_NAME=localhost
    
    # API URL (only change when you want to deploy the backend in a non standard way and you know what you are doing)
    API_BASE_URL=/api
    ```

3.  **Configure HTTPS (Optional):**
    Create a `certs/` folder in the project root. Place your certificate (`fullchain.pem`) and private key (`privkey.pem`) inside.

    Uncomment the following line from the compose.yml file:
    ```
    - ./certs:/etc/nginx/certs:ro
    ```
    

3.  **Build and Run:**
    Use Docker Compose to build the images and start the services.
    ```bash
    docker compose up -d
    ```
    * Add the `--build` flag to ensure that the backend and frontend images are built from the local source files defined in `docker/`.*

4.  **Access the Application:**
    Once the containers are running, access the web interface via your browser:
    *   **URL:** `http://localhost` (or the port specified in `FRONTEND_PORT`).

### 🔑 Default Login

To initialize the system, a default administrator account is created automatically.

*   **Username:** `admin`
*   **Password:** `admin`

> **⚠️ Security Warning:** Please log in and change the password immediately after the first deployment.

