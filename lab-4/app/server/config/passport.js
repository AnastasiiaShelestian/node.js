const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const findOrCreateOAuthUser = async ({
  name,
  email,
  isGoogle = false,
  isGitHub = false,
}) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password: "",
      google: isGoogle,
      github: isGitHub,
    });
  }
  return user;
};

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const user = await findOrCreateOAuthUser({
          name,
          email,
          isGoogle: true,
        });
        const token = generateToken(user);
        done(null, { token, user });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value || `${profile.username}@github.com`;
        const name = profile.displayName || profile.username;
        const user = await findOrCreateOAuthUser({
          name,
          email,
          isGitHub: true,
        });
        const token = generateToken(user);
        done(null, { token, user });
      } catch (error) {
        done(error, null);
      }
    }
  )
);
