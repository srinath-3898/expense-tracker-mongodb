const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");
require("dotenv").config();

const genereteToken = ({ _id, fullName, email, phone }) => {
  return jwt.sign({ _id, fullName, email, phone }, "UYGR$#%^&*UIHGHGCDXRSW", {
    expiresIn: "30d",
  });
};

const signup = async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;
    if (!fullName || !email || !mobile || !password) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    const userExits = await User.findOne({ where: { email } });
    if (userExits) {
      return res
        .status(403)
        .json({ status: false, data: null, message: "Account already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      fullName,
      email,
      mobile,
      password: hashedPassword,
      premiumUser: false,
      expenses: [],
      totalExpenses: 0,
    });
    if (!user) {
      throw new Error(
        "Some thing went wrong while signing up, please try again"
      );
    }
    return res.status(201).json({
      status: true,
      data: user,
      message: "Signedup successfully, please signin to continue...",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Email or password missing",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, data: null, message: "User not found" });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (user && !comparePassword) {
      return res
        .status(403)
        .json({ status: false, data: null, message: "Invalid credentials" });
    }
    const token = genereteToken(user);
    return res.status(201).json({
      status: true,
      data: { token, user },
      message: "Logged in successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const profile = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ status: true, data: req.user, message: "User profile" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { forgotPasswordEmail } = req.body;
    if (!forgotPasswordEmail) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing email",
      });
    }
    const user = await User.findOne({ email: forgotPasswordEmail });
    if (!user) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Please enter registered email id",
      });
    }
    const forgotPasswordRequest = await ForgotPasswordRequest.create({
      user: user._id,
    });
    if (!forgotPasswordRequest) {
      throw new Error(
        "Something went wrong while sending email, please try again"
      );
    }
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const sender = {
      email: "munnuru.srinath3898@gmail.com",
      name: "Munnuru Srinath",
    };
    const recievers = [{ email: forgotPasswordEmail }];
    const resetUrl = `http://localhost:3000/resetpassword/?requestId=${forgotPasswordRequest._id}`;
    const emailSent = await tranEmailApi.sendTransacEmail({
      sender,
      to: recievers,
      subject: "Reset Password",
      htmlContent: `<p>Hello ${user.fullName},</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });
    if (!emailSent) {
      throw new Error(
        "Something went wrong while sending email, please try again"
      );
    }
    return res.status(201).json({
      status: false,
      data: null,
      message:
        "An email has been sent to your registered mail id with the reset password link",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { requestId } = req.params;
    const forgotPasswordRequest = await ForgotPasswordRequest.findOne({
      _id: requestId,
      isActive: true,
    });
    if (!forgotPasswordRequest) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Invalid or expired reset link",
      });
    }
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ status: false, data: null, message: "Passwords do not match" });
    }
    const user = await User.findOne(forgotPasswordRequest.user);
    if (!user) {
      return res
        .status(404)
        .json({ status: false, data: null, message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Something went wrong please try again",
      });
    }
    const updatedForgotPasswordRequest =
      await ForgotPasswordRequest.findByIdAndUpdate(
        requestId,
        {
          isActive: false,
        },
        { new: true }
      );
    if (!updatedForgotPasswordRequest) {
      return res.status(404).json({
        status: false,
        data: null,
        message:
          "Something went wrong while resetting password, please try again...",
      });
    }
    return res.status(200).json({
      status: true,
      data: null,
      message: "Successfully changed your password",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { signup, signin, profile, forgotPassword, resetpassword };
