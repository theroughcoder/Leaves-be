import jwt from "jsonwebtoken";

 const generateToken = (user, expired) => {
  return jwt.sign(user, process.env.JWT_SECRET, {expiresIn: expired, });
};

export { generateToken };
