const mongoose = require("mongoose");

// db connection
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.DATABASE, {
    maxPoolSize: 10, // maximum number of connections in the pool
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

module.exports = mongoose;
