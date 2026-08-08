#!/bin/bash
LB_URL="http://localhost:9000"
REQUESTS_PER_SECOND=1

echo "======================================"
echo " Load Balancer Traffic Generator"
echo " Target: $LB_URL"
echo " Rate:   $REQUESTS_PER_SECOND req/sec"
echo "======================================"
echo ""
echo "Press Ctrl+C to stop"
echo ""

while true
do
    for ((i=1; i<=REQUESTS_PER_SECOND; i++))
    do
        (
            RESPONSE=$(curl -s "$LB_URL")

            SERVER=$(echo "$RESPONSE" | \
                grep -o '"server":"[^"]*"' | \
                cut -d'"' -f4)

            echo "$(date '+%H:%M:%S') -> $SERVER"
        ) &
    done

    sleep 1
done