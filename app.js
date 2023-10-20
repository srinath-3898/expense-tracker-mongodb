const express = require("express");
const cors = require("cors");
const sequelize = require("./configs/databaseConfig");
const connectDB = require("./configs/databaseConfig");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/user", require("./routes/userRoutes"));
app.use("/expense", require("./routes/expenseRoutes"));
app.use("/payment", require("./routes/paymentRoutes"));
app.use("/premium", require("./routes/premiumRoutes"));

const port = process.env.PORT;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
