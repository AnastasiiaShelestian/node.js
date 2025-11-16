const Sentry = require("@sentry/node");
const logger = require("../logger");
const ValidationError = require("../utils/errors/ValidationError");
const AppError = require("../utils/errors/AppError");

module.exports = (err, req, res, next) => {
  if (!(err instanceof ValidationError)) {
    Sentry.captureException(err);
  }

  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    path: req.originalUrl,
    method: req.method,
  });

  console.error("Ошибка:", err);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: "error",
      message: err.message,
      errors: err.errors,
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    status: "error",
    message: err.message || "Внутренняя ошибка сервера",
  });
};
