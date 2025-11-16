const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const verifyToken = require("../middleware/verifyToken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/errors/AppError");
const ValidationError = require("../utils/errors/ValidationError");

const router = express.Router();
const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError("Ошибка валидации данных", errors.array());
  }
};

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Имя обязательно"),
    body("email").isEmail().withMessage("Некорректный email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Пароль должен быть не менее 6 символов"),
  ],
  asyncHandler(async (req, res) => {
    handleValidation(req);

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Пользователь уже существует", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      status: "success",
      message: "Регистрация успешна",
    });
  })
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Некорректный email"),
    body("password").notEmpty().withMessage("Пароль обязателен"),
  ],
  asyncHandler(async (req, res) => {
    handleValidation(req);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Пользователь не найден", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Неверный пароль", 400);
    }

    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      return res.json({
        status: "success",
        message: "Требуется подтверждение 2FA",
        token: tempToken,
        twoFactor: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          twoFactorEnabled: true,
        },
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, twoFactorAuthenticated: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      status: "success",
      message: "Вход выполнен успешно",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  })
);

router.get(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json({
      status: "success",
      message: "Добро пожаловать в защищённый профиль!",
      user: req.user,
    });
  })
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const { token, user } = req.user;

    res.redirect(
      `http://localhost:5173/google-success?token=${token}&name=${user.name}&email=${user.email}`
    );
  }
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const { token, user } = req.user;

    res.redirect(
      `http://localhost:5173/github-success?token=${token}&name=${user.name}&email=${user.email}`
    );
  }
);

router.get(
  "/generate-2fa",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const secret = speakeasy.generateSecret({
      name: `MyApp (${req.user.email})`,
    });

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("Пользователь не найден", 404);
    }

    user.twoFactorSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        return next(new AppError("Ошибка генерации QR-кода", 500));
      }

      res.json({ status: "success", qrCode: data_url });
    });
  })
);

router.post(
  "/verify-2fa",
  [
    body("code")
      .notEmpty()
      .withMessage("Код 2FA обязателен")
      .isLength({ min: 6, max: 6 })
      .withMessage("Код должен состоять из 6 символов"),
  ],
  verifyToken,
  asyncHandler(async (req, res) => {
    handleValidation(req);

    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorSecret) {
      throw new AppError("2FA не настроена", 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!verified) {
      throw new AppError("Неверный код 2FA", 401);
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, twoFactorAuthenticated: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      status: "success",
      message: "2FA подтверждена успешно",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: true,
      },
    });
  })
);

router.post(
  "/enable-2fa",
  [
    body("code")
      .notEmpty()
      .withMessage("Код подтверждения обязателен")
      .isLength({ min: 6, max: 6 })
      .withMessage("Код должен состоять из 6 символов"),
  ],
  verifyToken,
  asyncHandler(async (req, res) => {
    handleValidation(req);

    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorSecret) {
      throw new AppError("2FA не настроена", 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!verified) {
      throw new AppError("Неверный код подтверждения", 401);
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({
      status: "success",
      message: "Двухфакторная аутентификация включена",
    });
  })
);

module.exports = router;
