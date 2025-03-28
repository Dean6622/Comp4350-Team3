/**
 * Middleware for errors
 */

// development error
// This will return the stacktrace
export const devError = (err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
  res.status(err["status"] || 500);
  res.json({
    message: err.message,
    error: err,
  });
};


// production error
// stacktrace not visible
export const prodError = (err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
  res.status(err.status || 500);
  res.json({
    message: err.message,
  });
};
