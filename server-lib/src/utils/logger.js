/**
 * Simple success/failure logger for certificate operations.
 * In production you could replace this with Winston/Pino.
 */
const log = {
  info(message, meta = {}) {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`, Object.keys(meta).length ? meta : '');
  },
  error(message, err = null) {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, err ? err.message || err : '');
  },
  success(operation, meta = {}) {
    console.log(`[SUCCESS] ${new Date().toISOString()} ${operation}`, meta);
  },
  failure(operation, reason, meta = {}) {
    console.error(`[FAILURE] ${new Date().toISOString()} ${operation} - ${reason}`, meta);
  },
};

export default log;
