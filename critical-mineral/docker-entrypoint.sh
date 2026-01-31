#!/bin/sh

# Docker entrypoint script for the application

# Exit immediately if a command exits with a non-zero status
set -e

# Print environment variables for debugging (without sensitive data)
echo "Starting MineralInsight Application..."
echo "Node Environment: $NODE_ENV"
echo "Port: $PORT"
echo "API Base URL: $VITE_API_BASE_URL"

# Wait for any dependent services to be ready (optional)
# if [ "$WAIT_FOR_SERVICES" = "true" ]; then
#   echo "Waiting for services to be ready..."
#   # Add service health checks here
# fi

# Run the command passed to the entrypoint
exec "$@"
