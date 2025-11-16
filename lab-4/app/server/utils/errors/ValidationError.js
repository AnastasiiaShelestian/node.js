const AppError = require("./AppError");

class ValidationError extends AppError {
  constructor(message = "Ошибка валидации данных", errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

module.exports = ValidationError;
