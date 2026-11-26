function errorHandler(err, req, res, next) {
  console.error('[CampusOS Error]:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
