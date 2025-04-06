require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("express-async-errors");
const adminRoutes = require("./routes/admin");
const cookieParser = require("cookie-parser");
const http = require("http"); // import http module
const cluster = require("cluster");
const os = require("os");
// const fs = require("fs");

const authRoutes = require("./routes/auth");
const appFeatureRoutes = require("./routes/appFeatureRoute");
const locationRoutes = require("./routes/locationRoute");
const { errorHandler } = require("./middlewares/error");
const morgan = require("morgan");
var bodyParser = require("body-parser");
const helmet = require("helmet");
const path = require("path");

const app = express();
// const corsOption = {
//   credentials: true,
//   origin: ["http://localhost:8081/", "*"],
// };

// db connection

const server = http.createServer(app);

require("./Db/db");

// Create a write stream (in append mode) to a log file
// const accessLogStream = fs.createWriteStream("access.log", { flags: "a" });

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
// // Morgan middleware setup with the file stream
// app.use(morgan("combined", { stream: accessLogStream }));
// app.use(morgan("combined"));

// const logDirectory = path.join(__dirname, "logs");
// fs.mkdirSync(logDirectory, { recursive: true });

// const accessLogStream = fs.createWriteStream(
//   path.join(logDirectory, "access.log"),
//   { flags: "a" }
// );

app.use(morgan("dev"));

app.use(helmet());

// route middlewares
app.use("/api", appFeatureRoutes);
app.use("/api", authRoutes);
app.use("/api", locationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/logs", function (req, res) {
  // res.sendFile(path.join(__dirname, "/logs/access.log"));
});

app.use(errorHandler);
const numCPUs = os.cpus().length;
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  console.log(`Worker ${process.pid} started`);
  // Start server
  const PORT = process.env.PORT || 4444;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
