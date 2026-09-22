/**
 * Centralized Express Error Handling Middleware
 * Ensures consistent JSON responses without exposing internal database schemas or sensitive details.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log detailed error server-side
  console.error('[PlanetPulse Error]', {
    method: req.method,
    path: req.originalUrl,
    name: err.name,
    message: err.message
  });

  // Mongoose schema validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('; ')
    });
  }

  // Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid identifier format for parameter: ${err.path || 'id'}`
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error'
    });
  }

  // Syntax error in JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request'
    });
  }

  // Explicit status code error from controller
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
