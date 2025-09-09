import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const securityKey = process.env.JWT_SECRET;

export const generateAuthJWT = (payload) => {
  if (!securityKey) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const { expires_in, ...params } = payload;
  const token = jwt.sign(params, securityKey, {
    expiresIn: expires_in || process.env.JWT_EXPIRES_IN || "30d",
  });

  return token;
};

export const decodeToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).send({
        statusCode: 401,
        success: false,
        message: 'No Authorization header provided',
        result: {}
      });
    }

    // Format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).send({
        statusCode: 401,
        success: false,
        message: 'Token missing',
        result: {}
      });
    }

    if (!securityKey) {
      return res.status(500).send({
        statusCode: 500,
        success: false,
        message: 'JWT_SECRET is not defined on the server',
        result: {}
      });
    }

    const decoded = jwt.verify(token, securityKey);
    req.token = decoded;
    next();
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: error.message || 'Internal server error',
      result: {}
    });
  }
};


export const decodeAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send({ /*...*/ });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, securityKey);
    req.user = decoded;  // for admin
    next();
  } catch (err) {
    return res.status(500).send({ /*...*/ });
  }
};



export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).send({
      statusCode: 403,
      success: false,
      message: "Access denied! Only admins can perform this action",
      result: {}
    });
  }
  next();
};
