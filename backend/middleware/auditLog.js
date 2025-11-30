const AuditLog = require('../models/AuditLog');

// Middleware to log user actions
const auditLog = (action, resource = null) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to log after response
    res.json = function (data) {
      // Log the action asynchronously (don't block response)
      setImmediate(async () => {
        try {
          if (req.user) {
            await AuditLog.create({
              user: req.user.id,
              action: action,
              resource: resource,
              resourceId: req.params.id || null,
              details: {
                method: req.method,
                path: req.path,
                body: sanitizeBody(req.body),
                query: req.query,
              },
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('user-agent'),
              status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
              errorMessage: res.statusCode >= 400 ? (data.message || 'Unknown error') : null,
            });
          }
        } catch (error) {
          // Don't fail the request if logging fails
          console.error('Audit log error:', error);
        }
      });

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

// Helper function to sanitize sensitive data from request body
const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

module.exports = auditLog;


