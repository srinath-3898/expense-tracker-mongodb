const getExpenses = async (req) => {
  await req.user.populate("expenses");
};

module.exports = { getExpenses };
