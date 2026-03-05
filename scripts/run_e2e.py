#!/usr/bin/env python3
"""Boot a disposable local stack and execute Playwright E2E tests.

This script is designed to run the same way locally and in CI.
"""

from __future__ import annotations

import argparse
import os
import shutil
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
BACKEND_DIR = ROOT_DIR / "backend"
BACKEND_SRC_DIR = BACKEND_DIR / "src"
TMP_DIR = ROOT_DIR / ".tmp"
BACKEND_LOG = TMP_DIR / "e2e-backend.log"

DB_CONTAINER = os.getenv("E2E_DB_CONTAINER", "triage-e2e-db")
DB_IMAGE = os.getenv("E2E_DB_IMAGE", "postgres:15-alpine")
DB_PORT = os.getenv("E2E_DB_PORT", "55432")
DB_NAME = os.getenv("E2E_DB_NAME", "triage_database")
DB_SUPERUSER = os.getenv("E2E_DB_SUPERUSER", "postgres")
DB_SUPERPASSWORD = os.getenv("E2E_DB_SUPERPASSWORD", "postgres")
APP_DB_USER = os.getenv("E2E_APP_DB_USER", "triage_backend")
APP_DB_PASSWORD = os.getenv("E2E_APP_DB_PASSWORD", "triage_backend")

BACKEND_HOST = os.getenv("E2E_BACKEND_HOST", "127.0.0.1")
BACKEND_PORT = os.getenv("E2E_BACKEND_PORT", "8000")
BACKEND_URL = f"http://{BACKEND_HOST}:{BACKEND_PORT}"

FRONTEND_HOST = os.getenv("E2E_FRONTEND_HOST", "localhost")
FRONTEND_PORT = os.getenv("E2E_FRONTEND_PORT", "3000")
FRONTEND_URL = f"http://{FRONTEND_HOST}:{FRONTEND_PORT}"

ADMIN_USERNAME = os.getenv("E2E_ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("E2E_ADMIN_PASSWORD", "admin")

KEEP_STACK = os.getenv("E2E_KEEP_STACK", "0") == "1"
INSTALL_FRONTEND_DEPS = os.getenv("E2E_INSTALL_FRONTEND_DEPS", "auto")
INSTALL_BACKEND_DEPS = os.getenv("E2E_INSTALL_BACKEND_DEPS", "auto")
INSTALL_PLAYWRIGHT = os.getenv("E2E_INSTALL_PLAYWRIGHT", "auto")


def log(msg: str) -> None:
    print(f"[e2e] {msg}")


def is_ci() -> bool:
    return os.getenv("CI", "").lower() in {"1", "true"}


def require_cmd(cmd: str) -> None:
    if shutil.which(cmd) is None:
        raise RuntimeError(f"Missing required command: {cmd}")


def run(
    args: Iterable[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    check: bool = True,
    capture_output: bool = False,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        list(args),
        cwd=cwd,
        env=env,
        check=check,
        text=True,
        capture_output=capture_output,
    )


def should_install(mode: str, marker: Path) -> bool:
    normalized = mode.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    if is_ci():
        return True
    return not marker.exists()


def docker_container_exists(name: str) -> bool:
    result = run(["docker", "inspect", name], check=False, capture_output=True)
    return result.returncode == 0


def wait_for_postgres(timeout_s: int = 90) -> None:
    start = time.monotonic()
    while time.monotonic() - start < timeout_s:
        result = run(
            [
                "docker",
                "exec",
                DB_CONTAINER,
                "pg_isready",
                "-U",
                DB_SUPERUSER,
                "-d",
                DB_NAME,
            ],
            check=False,
            capture_output=True,
        )
        if result.returncode == 0:
            return
        time.sleep(1)

    raise TimeoutError(f"Timed out waiting for PostgreSQL in container {DB_CONTAINER}")


def wait_for_http(url: str, *, timeout_s: int = 90) -> None:
    start = time.monotonic()
    while time.monotonic() - start < timeout_s:
        try:
            with urlopen(url, timeout=2):
                return
        except HTTPError:
            # Any HTTP response means the service is reachable.
            return
        except URLError:
            time.sleep(1)

    raise TimeoutError(f"Timed out waiting for HTTP endpoint: {url}")


def is_tcp_port_in_use(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex((host, port)) == 0


def ensure_backend_deps() -> None:
    venv_python = BACKEND_DIR / "venv" / "bin" / "python"
    if not should_install(INSTALL_BACKEND_DEPS, venv_python):
        return

    log("Installing backend dependencies")
    run([sys.executable, "-m", "venv", str(BACKEND_DIR / "venv")])
    run([str(venv_python), "-m", "pip", "install", "--upgrade", "pip"])
    run([str(venv_python), "-m", "pip", "install", "-r", str(BACKEND_DIR / "requirements.txt")])


def ensure_frontend_deps() -> None:
    if not should_install(INSTALL_FRONTEND_DEPS, FRONTEND_DIR / "node_modules"):
        return

    log("Installing frontend dependencies")
    run(["npm", "ci"], cwd=FRONTEND_DIR)


def ensure_playwright() -> None:
    marker = FRONTEND_DIR / "node_modules" / "playwright"
    if not should_install(INSTALL_PLAYWRIGHT, marker):
        return

    log("Installing Playwright browser")
    if is_ci():
        run(["npx", "playwright", "install", "--with-deps", "chromium"], cwd=FRONTEND_DIR)
    else:
        run(["npx", "playwright", "install", "chromium"], cwd=FRONTEND_DIR)


def start_database() -> None:
    log(f"Starting ephemeral PostgreSQL container ({DB_CONTAINER})")

    run(["docker", "rm", "-f", DB_CONTAINER], check=False, capture_output=True)

    run(
        [
            "docker",
            "run",
            "-d",
            "--rm",
            "--name",
            DB_CONTAINER,
            "-e",
            f"POSTGRES_DB={DB_NAME}",
            "-e",
            f"POSTGRES_USER={DB_SUPERUSER}",
            "-e",
            f"POSTGRES_PASSWORD={DB_SUPERPASSWORD}",
            "-e",
            f"APP_DB_PASSWORD={APP_DB_PASSWORD}",
            "-p",
            f"{DB_PORT}:5432",
            "-v",
            f"{BACKEND_DIR / '00-init-user.sh'}:/docker-entrypoint-initdb.d/00-init-user.sh:ro",
            "-v",
            f"{BACKEND_DIR / 'init.sql'}:/docker-entrypoint-initdb.d/01-init.sql:ro",
            DB_IMAGE,
        ]
    )

    wait_for_postgres()


def start_backend() -> subprocess.Popen[str]:
    backend_python = BACKEND_DIR / "venv" / "bin" / "python"
    python_exec = str(backend_python if backend_python.exists() else Path(sys.executable))

    TMP_DIR.mkdir(exist_ok=True)

    backend_port_num = int(BACKEND_PORT)
    if is_tcp_port_in_use(BACKEND_HOST, backend_port_num):
        raise RuntimeError(
            f"Port {BACKEND_PORT} on {BACKEND_HOST} is already in use. "
            "Stop the running service or set E2E_BACKEND_PORT to a free port."
        )

    log(f"Starting backend on {BACKEND_URL}")
    env = os.environ.copy()
    env.update(
        {
            "DB_HOST": BACKEND_HOST,
            "DB_PORT": DB_PORT,
            "DB_NAME": DB_NAME,
            "DB_USER": APP_DB_USER,
            "DB_PASSWORD": APP_DB_PASSWORD,
            "STORAGE_ROOT": str(BACKEND_DIR / "source"),
            "CORS_ORIGINS": ",".join(
                [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost",
                    "http://127.0.0.1",
                ]
            ),
        }
    )

    log_handle = BACKEND_LOG.open("w", encoding="utf-8")
    process = subprocess.Popen(
        [
            python_exec,
            "-m",
            "uvicorn",
            "main:app",
            "--host",
            BACKEND_HOST,
            "--port",
            BACKEND_PORT,
        ],
        cwd=BACKEND_SRC_DIR,
        env=env,
        stdout=log_handle,
        stderr=subprocess.STDOUT,
        text=True,
    )

    wait_for_http(f"{BACKEND_URL}/api/login")
    if process.poll() is not None:
        raise RuntimeError(
            "Backend process exited during startup. "
            f"Check {BACKEND_LOG} for details."
        )
    return process


def run_e2e(playwright_args: list[str]) -> int:
    log("Running Playwright E2E suite")
    env = os.environ.copy()
    env.update(
        {
            "VITE_API_BASE_URL": f"{BACKEND_URL}/api",
            "E2E_BASE_URL": FRONTEND_URL,
            "E2E_ADMIN_USERNAME": ADMIN_USERNAME,
            "E2E_ADMIN_PASSWORD": ADMIN_PASSWORD,
        }
    )

    cmd = ["npm", "run", "test:ui", "--", *playwright_args]
    result = run(cmd, cwd=FRONTEND_DIR, env=env, check=False)
    return result.returncode


def stop_backend(process: subprocess.Popen[str] | None) -> None:
    if process is None:
        return
    if process.poll() is not None:
        return

    log(f"Stopping backend (pid {process.pid})")
    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()


def stop_database() -> None:
    if KEEP_STACK:
        return
    if not docker_container_exists(DB_CONTAINER):
        return

    log(f"Stopping database container {DB_CONTAINER}")
    run(["docker", "rm", "-f", DB_CONTAINER], check=False, capture_output=True)


def print_backend_log_tail(lines: int = 80) -> None:
    if not BACKEND_LOG.exists():
        return

    log("Backend log tail")
    with BACKEND_LOG.open("r", encoding="utf-8") as handle:
        content = handle.readlines()
    for line in content[-lines:]:
        print(line.rstrip())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Start DB/backend and run Playwright E2E tests.",
    )
    parser.add_argument(
        "playwright_args",
        nargs=argparse.REMAINDER,
        help="Arguments passed through to `npm run test:ui -- ...`",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    TMP_DIR.mkdir(exist_ok=True)
    if BACKEND_LOG.exists():
        BACKEND_LOG.unlink()

    for cmd in ("docker", "python3", "npm"):
        require_cmd(cmd)

    ensure_frontend_deps()
    ensure_backend_deps()
    ensure_playwright()

    backend_process: subprocess.Popen[str] | None = None
    exit_code = 0

    interrupted = {"value": False}

    def handle_signal(_signum: int, _frame: object) -> None:
        interrupted["value"] = True
        raise KeyboardInterrupt

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    try:
        start_database()
        backend_process = start_backend()
        exit_code = run_e2e(args.playwright_args)
        return exit_code
    except KeyboardInterrupt:
        exit_code = 130
        return 130
    finally:
        stop_backend(backend_process)
        stop_database()
        if interrupted["value"] or exit_code != 0:
            print_backend_log_tail()


if __name__ == "__main__":
    try:
        exit_code = main()
    except Exception as exc:
        print(f"[e2e] Failed: {exc}", file=sys.stderr)
        print_backend_log_tail()
        exit_code = 1

    sys.exit(exit_code)
