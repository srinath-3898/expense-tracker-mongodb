const mongoose = require("mongoose");

const forgotPasswordRequestSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, required: true, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const ForgotPasswordRequest = mongoose.model(
  "ForgotPasswordRequest",
  forgotPasswordRequestSchema
);

module.exports = ForgotPasswordRequest;
