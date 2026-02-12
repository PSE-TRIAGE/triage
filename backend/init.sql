-- Grant privileges to triage_backend user (created by 00-init-user.sql)
GRANT ALL PRIVILEGES ON DATABASE triage_database TO triage_backend;
GRANT ALL ON SCHEMA public TO triage_backend;
GRANT ALL ON ALL TABLES IN SCHEMA public TO triage_backend;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO triage_backend;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO triage_backend;

-- Creating Tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP
);

CREATE TABLE projects (
	id SERIAL PRIMARY KEY,
	name TEXT UNIQUE NOT NULL,
	last_algorithm TEXT DEFAULT 'Ranked by order in File' NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE mutants(
	id SERIAL PRIMARY KEY,
	project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
	-- arguments from the xml
	detected BOOLEAN NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('KILLED', 'SURVIVED', 'NO_COVERAGE', 'NON_VIABLE', 'TIMED_OUT', 'MEMORY_ERROR', 'RUN_ERROR')),
	numberOfTestsRun INTEGER NOT NULL,
	sourceFile TEXT NOT NULL,
	mutatedClass TEXT NOT NULL,
	mutatedMethod  TEXT NOT NULL,
	methodDescription TEXT NOT NULL,
	lineNumber INTEGER NOT NULL,
	mutator TEXT NOT NULL,
	killingTest TEXT,
	description TEXT NOT NULL,
	additionalFields JSONB,
	-- end arguments from the xml
	ranking INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE rating(
	id SERIAL PRIMARY KEY,
	mutant_id INTEGER NOT NULL REFERENCES mutants(id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	UNIQUE (mutant_id, user_id)
);

CREATE TABLE project_assignments(
	user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, project_id)
);

CREATE TABLE form_fields(
	id SERIAL PRIMARY KEY,
	project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
	label TEXT NOT NULL,
	type TEXT NOT NULL CHECK (type IN ('rating', 'checkbox', 'text', 'integer')),
	is_required BOOLEAN DEFAULT FALSE NOT NULL,
	position INTEGER NOT NULL,
	UNIQUE (project_id, position)
);

CREATE TABLE form_field_values(
	id SERIAL PRIMARY KEY,
	form_field_id INTEGER NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
	rating_id INTEGER NOT NULL REFERENCES rating(id) ON DELETE CASCADE,
	value TEXT NOT NULL
);

-- Grant permissions on newly created tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO triage_backend;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO triage_backend;

-- Populate tables with default admin and password 'admin'
INSERT INTO users (username, password_hash, is_admin) VALUES ('admin', '$2b$12$mAaZcN1wyllVVG1lsZ/zZOgMaXWowN6A6zq96bExBX.C7WpkuDc/W', TRUE);
