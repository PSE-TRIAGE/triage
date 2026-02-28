#!/usr/bin/env python3
"""Start a local dev setup: Postgres container + backend + frontend."""

import os
import shlex
import signal
import subprocess
import sys
import time
from pathlib import Path
from shutil import which

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
DNA_FILE = ROOT_DIR / "dna.txt"

CONTAINER_NAME = os.getenv("DEV_DB_CONTAINER", "triage-postgres")
IMAGE = os.getenv("DEV_DB_IMAGE", "postgres:15-alpine")
POSTGRES_USER = os.getenv("DEV_DB_SUPERUSER", "postgres")
POSTGRES_DB = os.getenv("DEV_DB_NAME", "triage_database")
DB_PORT = os.getenv("DEV_DB_PORT", "5432")
APP_DB_USER = os.getenv("DEV_APP_DB_USER", "triage_backend")
VOLUME_NAME = os.getenv("DEV_DB_VOLUME", "triage_postgres_data")

backend_process = None
frontend_process = None
container_runtime = None
stop_db_on_exit = False
shutting_down = False


def read_env_file(path):
    values = {}
    if not path.exists():
        return values

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        values[key] = value
    return values


def run_command(cmd, check=True, capture_output=False, cwd=None, env=None):
    try:
        return subprocess.run(
            cmd,
            check=check,
            capture_output=capture_output,
            text=True,
            cwd=cwd,
            env=env,
        )
    except FileNotFoundError:
        print(f"Required executable not found: {cmd[0]}")
        raise
    except subprocess.CalledProcessError as exc:
        joined = " ".join(shlex.quote(part) for part in cmd)
        print(f"Command failed: {joined}")
        if exc.stderr:
            print(exc.stderr.strip())
        raise


def detect_container_runtime():
    for candidate in ("docker", "podman"):
        if which(candidate):
            return candidate
    raise RuntimeError("Neither docker nor podman was found in PATH.")


def container_exists():
    result = run_command(
        [container_runtime, "container", "inspect", CONTAINER_NAME],
        check=False,
        capture_output=True,
    )
    return result.returncode == 0


def container_running():
    result = run_command(
        [container_runtime, "inspect", "-f", "{{.State.Running}}", CONTAINER_NAME],
        check=False,
        capture_output=True,
    )
    return result.returncode == 0 and result.stdout.strip() == "true"


def wait_for_postgres():
    max_attempts = 60
    for attempt in range(1, max_attempts + 1):
        result = run_command(
            [
                container_runtime,
                "exec",
                CONTAINER_NAME,
                "pg_isready",
                "-U",
                POSTGRES_USER,
                "-d",
                POSTGRES_DB,
            ],
            check=False,
            capture_output=True,
        )
        if result.returncode == 0:
            return True

        if attempt % 5 == 0:
            print(f"  still waiting for PostgreSQL ({attempt}/{max_attempts})")
        time.sleep(1)
    return False


def validate_identifier(name):
    if not name or not name.replace("_", "").isalnum():
        raise ValueError(
            f"Invalid identifier: {name!r}. Only alphanumeric characters and '_' are allowed."
        )


def sql_escape(value):
    return value.replace("'", "''")


def ensure_backend_db_user(app_db_password):
    validate_identifier(APP_DB_USER)
    validate_identifier(POSTGRES_DB)

    sql = f"""
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{APP_DB_USER}') THEN
        CREATE USER {APP_DB_USER} WITH PASSWORD '{sql_escape(app_db_password)}';
    ELSE
        ALTER USER {APP_DB_USER} WITH PASSWORD '{sql_escape(app_db_password)}';
    END IF;
END
$$;
GRANT ALL PRIVILEGES ON DATABASE {POSTGRES_DB} TO {APP_DB_USER};
"""
    run_command(
        [
            container_runtime,
            "exec",
            CONTAINER_NAME,
            "psql",
            "-U",
            POSTGRES_USER,
            "-d",
            POSTGRES_DB,
            "-v",
            "ON_ERROR_STOP=1",
            "-c",
            sql,
        ]
    )


def docker_mount_path(path):
    resolved = str(path.resolve())
    if os.name == "nt":
        return resolved.replace("\\", "/")
    return resolved


def ensure_postgres(superuser_password, app_db_password):
    global stop_db_on_exit

    init_user_script = ROOT_DIR / "backend" / "00-init-user.sh"
    init_sql = ROOT_DIR / "backend" / "init.sql"

    if not init_user_script.exists():
        raise FileNotFoundError(f"Missing init script: {init_user_script}")
    if not init_sql.exists():
        raise FileNotFoundError(f"Missing init sql: {init_sql}")

    if container_running():
        print(f"{CONTAINER_NAME} is already running.")
    elif container_exists():
        print(f"Starting existing container {CONTAINER_NAME}...")
        run_command([container_runtime, "start", CONTAINER_NAME])
        stop_db_on_exit = True
    else:
        print(f"Creating and starting {CONTAINER_NAME}...")
        run_command(
            [
                container_runtime,
                "run",
                "-d",
                "--name",
                CONTAINER_NAME,
                "-e",
                f"POSTGRES_USER={POSTGRES_USER}",
                "-e",
                f"POSTGRES_PASSWORD={superuser_password}",
                "-e",
                f"POSTGRES_DB={POSTGRES_DB}",
                "-e",
                f"APP_DB_PASSWORD={app_db_password}",
                "-p",
                f"{DB_PORT}:5432",
                "-v",
                f"{VOLUME_NAME}:/var/lib/postgresql/data",
                "-v",
                f"{docker_mount_path(init_user_script)}:/docker-entrypoint-initdb.d/00-init-user.sh:ro",
                "-v",
                f"{docker_mount_path(init_sql)}:/docker-entrypoint-initdb.d/01-init.sql:ro",
                IMAGE,
            ]
        )
        stop_db_on_exit = True

    print("Waiting for PostgreSQL...")
    if not wait_for_postgres():
        return False

    ensure_backend_db_user(app_db_password)
    return True


def stop_process(name, process):
    if process is None or process.poll() is not None:
        return

    print(f"Stopping {name}...")
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()


def cleanup(exit_code=0):
    global shutting_down
    if shutting_down:
        return
    shutting_down = True

    print("\nShutting down...")
    stop_process("backend server", backend_process)
    stop_process("frontend dev server", frontend_process)

    if stop_db_on_exit and container_running():
        print(f"Stopping {CONTAINER_NAME}...")
        run_command([container_runtime, "stop", CONTAINER_NAME], check=False)

    sys.exit(exit_code)


def signal_handler(_signum, _frame):
    cleanup(0)


def maybe_print_dna():
    if DNA_FILE.exists():
        print(DNA_FILE.read_text(encoding="utf-8"))
    else:
        print("dna.txt is missing; continuing without banner.")


def start_backend(app_db_password):
    global backend_process

    env = os.environ.copy()
    env.update(
        {
            "DB_HOST": "localhost",
            "DB_PORT": DB_PORT,
            "DB_NAME": POSTGRES_DB,
            "DB_USER": APP_DB_USER,
            "DB_PASSWORD": app_db_password,
        }
    )

    if sys.platform == "win32" and (BACKEND_DIR / "run.bat").exists():
        backend_process = subprocess.Popen(["run.bat"], cwd=BACKEND_DIR, env=env, shell=True)
    else:
        backend_process = subprocess.Popen(["./run.sh"], cwd=BACKEND_DIR, env=env)


def start_frontend():
    global frontend_process

    env = os.environ.copy()
    env.setdefault("VITE_API_BASE_URL", "http://localhost:8000/api")

    if sys.platform == "win32":
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=FRONTEND_DIR,
            env=env,
            shell=True,
        )
    else:
        frontend_process = subprocess.Popen(["npm", "run", "dev"], cwd=FRONTEND_DIR, env=env)


def main():
    global container_runtime

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    env_file_values = read_env_file(ROOT_DIR / ".env")
    superuser_password = os.getenv("DB_PASSWORD", env_file_values.get("DB_PASSWORD", "postgres"))
    app_db_password = os.getenv(
        "APP_DB_PASSWORD",
        env_file_values.get("APP_DB_PASSWORD", "triage_backend"),
    )

    container_runtime = detect_container_runtime()
    maybe_print_dna()
    print("Starting development environment...\n")

    if not ensure_postgres(superuser_password, app_db_password):
        print("PostgreSQL failed to become ready.")
        cleanup(1)

    print(
        f"PostgreSQL ready at postgresql://{APP_DB_USER}:<redacted>@localhost:{DB_PORT}/{POSTGRES_DB}\n"
    )

    print("Starting backend server...")
    start_backend(app_db_password)
    print("Starting frontend dev server...")
    start_frontend()

    print("\nPress Ctrl+C to stop all services.")
    print("=" * 60)

    while True:
        time.sleep(1)

        if backend_process and backend_process.poll() is not None:
            print(f"Backend exited with code {backend_process.returncode}.")
            cleanup(backend_process.returncode or 1)

        if frontend_process and frontend_process.poll() is not None:
            print(f"Frontend exited with code {frontend_process.returncode}.")
            cleanup(frontend_process.returncode or 1)


if __name__ == "__main__":
    main()
