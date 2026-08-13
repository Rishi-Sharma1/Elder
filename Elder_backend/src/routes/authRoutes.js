import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import verifyUser from "../middleware/verifyUser.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, password, and role are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      profileCompleted: false,
      approved: role === "ngo" ? false : true,
    });

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ token, user: userObj });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Register failed",
      error: error.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ token, user: userObj });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// GET CURRENT USER
router.get("/me", verifyUser, (req, res) => {
  return res.status(200).json(req.user || null);
});

router.get("/status", verifyUser, (req, res) => {
  const user = req.user;

  const ready =
    user.profileCompleted === true && user.verification?.status === "verified";

  res.json({
    profileCompleted: user.profileCompleted,
    verificationStatus: user.verification?.status,
    ready,
  });
});

router.put("/update-profile", verifyUser, async (req, res) => {
  try {
    const { phone, address, gender, emergencyContact, idFrontUrl, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.phone = phone;
    user.address = address;
    user.gender = gender;

    if (profilePhoto) {
      user.profilePhoto = profilePhoto;
    }

    if (user.role === "elder") {
      user.emergencyContact = emergencyContact;
    }

    if (idFrontUrl) {
      user.verification = {
        idFrontUrl,
        status: "pending",
      };
    }

    // profile completed check
    if (phone && address && gender) {
      user.profileCompleted = true;
    }

    await user.save();

    res.status(200).json(user);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
});

router.put("/upload-id", verifyUser, async (req, res) => {
  try {
    const { idType, idFrontUrl, idBackUrl, selfieUrl } = req.body;

    const user = await User.findById(req.user._id);

    user.verification.idType = idType;
    user.verification.idFrontUrl = idFrontUrl;
    user.verification.idBackUrl = idBackUrl;
    user.verification.selfieUrl = selfieUrl;
    user.verification.status = "pending";
    user.verification.rejectionReason = null;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error("UPLOAD ID ERROR:", err);
    res.status(500).json({ message: "Failed to upload ID" });
  }
});

export default router;
