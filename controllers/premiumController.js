const User = require("../models/userModel");
const { getExpenses } = require("../services/userServices");
const { uploadToS3 } = require("../services/s3Services");
const Download = require("../models/downloadModel");

const leaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find();
    if (!leaderboard) {
      throw new Error(
        "Something went wrong while fetching expenses, please try again"
      );
    }
    return res
      .status(200)
      .json({ status: true, data: leaderboard, message: "Leaderboard" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const download = async (req, res) => {
  try {
    await getExpenses(req);
    const expenses = req.user.expenses;
    if (!expenses) {
      throw new Error(
        "Something went wrong while downloading expenses, please try again"
      );
    }
    if (expenses.length === 0) {
      return res.status(200).json({
        status: false,
        data: null,
        message: "You don't have any expenses, for generating report",
      });
    }
    const stringifiedExpenses = JSON.stringify(expenses);
    const fileName = `Expenses${req.user.id}/${new Date()}.txt`;
    const s3Response = await uploadToS3(stringifiedExpenses, fileName);
    if (!s3Response) {
      throw new Error("Error uploading file to S3");
    }
    const downloadedAt = s3Response.Key.split("/")[1].slice(
      0,
      s3Response.Key.split("/")[1] - 4
    );
    const download = Download.create({
      downloadedAt,
      url: s3Response.Location,
    });
    if (!download) {
      throw new Error(
        "Something went wrong while downloading expenses, please try again"
      );
    }
    return res.status(200).json({
      status: false,
      data: s3Response.Location,
      message: "Successfully downloaded expenses",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { leaderboard, download };
