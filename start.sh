#!/bin/bash

# Check if PostgreSQL is already running, if not start it
if ! pg_ctl -D /home/runner/workspace/pgdata status > /dev/null 2>&1; then
    pg_ctl -D /home/runner/workspace/pgdata -l /home/runner/workspace/pgdata/logfile start
    sleep 5
fi

# Create database if it doesn't exist
psql -h /home/runner/workspace/pg_socket -U runner -d postgres -c "SELECT 1 FROM pg_database WHERE datname = 'snapbuy'" | grep -q 1 || psql -h /home/runner/workspace/pg_socket -U runner -d postgres -c "CREATE DATABASE snapbuy"

# Run the Spring Boot application
cd /home/runner/workspace
export JAVA_HOME=/nix/store/k95pqfzyvrna93hc9a4cg5csl7l4fh0d-openjdk-21.0.7+6

# Override database settings to use local PostgreSQL
export DATABASE_URL=jdbc:postgresql://localhost:5432/snapbuy
export PGUSER=runner
export PGPASSWORD=
export PGDATABASE=snapbuy

java -jar target/SnapBuy-0.0.1-SNAPSHOT.jar
