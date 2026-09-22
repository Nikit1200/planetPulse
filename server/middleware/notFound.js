/**
 * 404 Route Not Found Middleware
 * Returns standardized JSON error response.
 */
const notFound = (req, res, next) => { // eslint-disable-line no-unused-vars
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};

module.exports = notFound;
