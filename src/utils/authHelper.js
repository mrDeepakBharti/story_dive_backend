import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import validator from "validator";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Generate JWT
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const generateReferralCode = (userName) => {
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${userName.slice(0, 3).toUpperCase()}${randomString}`;
};
// ✅ Validate Email
export const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// ✅ Validate Strong Password
export const isValidPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};


export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).send({
        statusCode: "401",
        success: false,
        message: "Authorization header missing",
      });
    }

    // Expect "Bearer token"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).send({
        statusCode: "401",
        success: false,
        message: "Token missing",
      });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({
          statusCode: "403",
          success: false,
          message: "Invalid or expired token",
        });
      }

      req.user = decoded; // ✅ attach decoded user data (e.g. id, email)
      next();
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: "500",
      success: false,
      message: "Token verification failed",
      error: error.message,
    });
  }
};