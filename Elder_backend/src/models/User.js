import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    password: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ["elder", "volunteer", "ngo", "admin"],
      required: true,
    },

    // NGO Memberships
    joinedNGO: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For Elder
    joinedNGOs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // For Volunteer

    // ✅ ADD THESE
    phone: { type: String },
    address: { type: String },
    gender: { type: String },
    emergencyContact: { type: String },
    profilePhoto: { type: String, default: "" },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    approved: {
      type: Boolean,
      default: true,
    },

    verification: {
      idType: { type: String },
      idFrontUrl: { type: String },
      idBackUrl: { type: String },
      selfieUrl: { type: String },

      status: {
        type: String,
        enum: ["not_uploaded", "pending", "verified", "rejected"],
        default: "not_uploaded",
      },

      rejectionReason: { type: String },
      verifiedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
