const Payment = require("../models/payment");
const Razorpay = require("razorpay");
require("dotenv").config();

const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const orderExists = await Payment.findOne({ orderId: orderId });
    if (orderExists) {
      return res
        .status(409)
        .json({ status: false, data: null, message: "Order already created" });
    }
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    instance.orders.create(
      { amount: 10000, currency: "INR" },
      async (error, response) => {
        if (error) {
          return res
            .status(500)
            .json({ status: false, data: null, message: error.message });
        }
        const { id, amount, currency } = response;
        const payment = await Payment.create({
          orderId: orderId,
          rpOrderId: id,
          userId: req.user._id,
          amount: amount / 100,
          currency: currency,
          status: "PENDING",
        });
        if (!payment) {
          throw new Error(
            "Something went wrong while creating payment, please try again"
          );
        }
        return res.status(201).json({
          status: true,
          data: payment,
          message:
            "Your order has been created successfully, redirecting to payments screen...",
        });
      }
    );
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { rpOrderId, status } = req.body;
    if (!rpOrderId || !status) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    const payment = await Payment.findOne({ rpOrderId: rpOrderId });
    if (!payment) {
      return res
        .status(400)
        .json({ status: false, data: null, message: "Order not found" });
    }
    await Payment.findByIdAndUpdate(
      payment._id,
      {
        status: status,
      },
      { new: true }
    );
    req.user.premiumUser = status === "SUCCESS" ? true : false;
    await req.user.save();
    return res
      .status(201)
      .json({ status: true, data: null, message: "Payment success" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { createOrder, updateStatus };
