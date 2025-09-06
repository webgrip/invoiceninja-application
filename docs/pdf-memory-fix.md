# PDF Generation Memory Fix

## Problem
Invoice Ninja was experiencing Out of Memory (OOM) errors when generating PDFs in Kubernetes, causing pod crashes and failed PDF exports.

## Root Cause Analysis
1. **PHP Memory Limit**: The base Invoice Ninja image had a memory_limit of only 128M, insufficient for PDF generation
2. **Kubernetes Memory Limits**: Container memory limits were set to 512Mi, which became inadequate under heavy PDF processing
3. **Upload Limits**: Small file upload limits (8M) were preventing large document processing
4. **Request Timeouts**: Short timeouts (300s) were causing PDF generation failures for complex invoices

## Solution Implemented

### 1. PHP Configuration Optimization (`ops/docker/application/php.ini`)
- **Memory Limit**: Increased from 128M to 512M
- **Execution Time**: Set to 300 seconds for complex PDF generation
- **Upload Limits**: Increased to 50M for both upload_max_filesize and post_max_size
- **Input Variables**: Increased max_input_vars to 3000 for complex forms
- **OPcache**: Optimized for better performance

### 2. Kubernetes Resource Limits (`ops/helm/invoiceninja-application/values.yaml`)
- **Memory Request**: Increased from 256Mi to 512Mi (guaranteed memory)
- **Memory Limit**: Increased from 512Mi to 1Gi (maximum allowed memory)
- **CPU Limit**: Increased from 500m to 1000m (1 full CPU core for PDF processing)

### 3. Nginx Configuration (`ops/docker/nginx/config/default.conf`)
- **Client Body Size**: Increased from 20M to 50M
- **FastCGI Timeout**: Increased from 300s to 600s for read operations
- Kept send and connect timeouts at 300s for responsiveness

### 4. Docker Configuration
- Added custom PHP configuration copying with proper load order (`zz-custom.ini`)
- Ensured configuration loads after base image configurations

## Testing
Created comprehensive test suite (`tests/integration/test-memory-config.sh`) that verifies:
- PHP memory_limit is correctly set to 512M
- Upload limits are properly configured (50M)
- Memory allocation works correctly (100MB test allocation)
- All configuration values are applied correctly

## Expected Impact
- **PDF Generation**: No more OOM errors during PDF creation
- **Large Invoices**: Can handle invoices with many line items or complex layouts
- **File Uploads**: Support for larger file attachments (up to 50M)
- **Performance**: Better resource utilization with proper CPU and memory allocation
- **Stability**: Reduced pod crashes and failed requests

## Monitoring Recommendations
1. Monitor memory usage patterns after deployment
2. Set up alerts for memory usage > 80% of 1Gi limit
3. Track PDF generation success/failure rates
4. Monitor request duration for PDF endpoints

## Rollback Plan
If issues arise, the previous configuration can be restored by:
1. Reverting the Kubernetes memory limits to original values
2. Removing the custom PHP configuration file
3. Restoring nginx timeout values

## Files Changed
- `ops/docker/application/Dockerfile` - Added PHP configuration copy
- `ops/docker/application/php.ini` - New PHP configuration file
- `ops/helm/invoiceninja-application/values.yaml` - Updated memory limits
- `ops/docker/nginx/config/default.conf` - Updated timeouts and body size
- `tests/integration/test-memory-config.sh` - New test suite