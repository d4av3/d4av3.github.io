#!/bin/bash

# Directory to back up
SOURCE_DIR="$1"

# Check if source directory is provided
if [ -z "$SOURCE_DIR" ]; then
  echo "Usage: $0 <source_directory>"
  exit 1
fi

# Get current timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup destination
BACKUP_DIR="/path/to/backup/directory"  # Change this to your backup directory
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"

# Create a compressed archive
tar -czf "$BACKUP_FILE" -C "$SOURCE_DIR" .

# Confirmation message
echo "Backup of '$SOURCE_DIR' created at '$BACKUP_FILE'"
