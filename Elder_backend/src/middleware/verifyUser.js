import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "elder_connect_jwt_secret_key_2026_safe");

    const user = await User.findById(decoded.id || decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    req.user = user;   // 🔥 MONGO USER DOC
    req.userId = user._id.toString();

    next();
  } catch (err) {
    console.error("VERIFY USER ERROR:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default verifyUser;
