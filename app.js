const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/databaseConfig");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/user", require("./routes/user"));
app.use("/expense", require("./routes/expense"));
app.use("/payment", require("./routes/payment"));
app.use("/premium", require("./routes/premium"));

const port = process.env.PORT;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
