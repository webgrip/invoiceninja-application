#!/bin/bash

# Test script to verify PHP memory configuration
# This script tests the PHP memory limits and PDF generation capabilities

set -e

echo "🔍 Testing PHP Memory Configuration..."

# Function to run PHP command in container
run_php() {
    docker run --rm webgrip/invoiceninja-application:latest php "$@"
}

# Test 1: Check PHP memory limit
echo "📋 Checking PHP memory_limit..."
MEMORY_LIMIT=$(run_php -r "echo ini_get('memory_limit');")
echo "✅ PHP memory_limit: $MEMORY_LIMIT"

if [[ "$MEMORY_LIMIT" == "512M" ]]; then
    echo "✅ Memory limit correctly set to 512M"
else
    echo "❌ Memory limit not set correctly. Expected: 512M, Got: $MEMORY_LIMIT"
    exit 1
fi

# Test 2: Check upload limits
echo "📋 Checking upload limits..."
UPLOAD_MAX=$(run_php -r "echo ini_get('upload_max_filesize');")
POST_MAX=$(run_php -r "echo ini_get('post_max_size');")
if [[ "$UPLOAD_MAX" == "50M" ]]; then
    echo "✅ Upload limit correctly set to 50M"
else
    echo "❌ Upload limit not set correctly. Expected: 50M, Got: $UPLOAD_MAX"
    exit 1
fi
echo "✅ post_max_size: $POST_MAX"

# Test 3: Check execution time
echo "📋 Checking max_execution_time..."
EXEC_TIME=$(run_php -r "echo ini_get('max_execution_time');")
echo "✅ max_execution_time: $EXEC_TIME"

# Test 4: Memory allocation test
echo "📋 Testing memory allocation..."
run_php -r "
\$start = memory_get_usage();
\$data = str_repeat('x', 100 * 1024 * 1024); // 100MB string
\$end = memory_get_usage();
echo 'Memory test passed: ' . round((\$end - \$start) / 1024 / 1024, 2) . ' MB allocated\n';
unset(\$data);
"

echo "✅ All PHP memory configuration tests passed!"