#!/bin/bash

# CPU Information
CPU_INFO=$(top -bn1 | grep "Cpu(s)" | sed "s/,/ /g;s/ *\+/\ /g;" | awk '{printf "CPU Usage: %.2f%%\n", 100 - $8}')

# Memory Information
MEMORY_INFO=$(free -h | awk '/^Mem/ {printf "Memory Usage: %s/%s (%.2f%%)\n", $3, $2, $3/$2 * 100}')

# Disk Usage
DISK_INFO=$(df -h | awk '$NF=="/"{printf "Disk Usage: %s/%s (%.2f%%)\n", $3, $2, $3/$2 * 100}')

# Uptime
UPTIME_INFO=$(uptime -p)

# IP Address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

# Display the summary
echo "----- System Information -----"
echo "$CPU_INFO"
echo "$MEMORY_INFO"
echo "$DISK_INFO"
echo "$UPTIME_INFO"
echo "IP Address: $IP_ADDRESS"
