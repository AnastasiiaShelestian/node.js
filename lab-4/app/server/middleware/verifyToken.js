const jwt = require("jsonwebtoken");
const AppError = require("../utils/errors/AppError");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Нет токена авторизации", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      twoFactorAuthenticated: decoded.twoFactorAuthenticated || false,
    };

    next();
  } catch (err) {
    console.error("Ошибка верификации токена:", err);
    return next(new AppError("Невалидный токен", 401));
  }
};
