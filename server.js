require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const shortId = require("shortid");
const port = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.DB_URI || "mongodb://localhost/exercise-track", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const NewUser = mongoose.model(
  "NewUser",
  new mongoose.Schema({
    _id: String,
    username: String,
  })
);

const NewExercise = mongoose.model(
  "NewExercise",
  new mongoose.Schema({
    _id: String,
    username: String,
    description: String,
    duration: Number,
    date: String,
  })
);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// app.use((req, res, next) => {
//   return next({ status: 404, message: "Not Found" });
// });

app.use((err, req, res, next) => {
  let errCode, errMessage;
  if (err.errors) {
    errCode = 400;
    const keys = Object.keys(err.errors);
    errMessage = err.errors[keys[0]].message;
  } else {
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res.status(errCode).type("txt").send(errMessage);
});

app.post("/api/exercise/new-user", (req, res) => {
  const userId = shortId.generate();
  const { username } = req.body;

  const newUser = new NewUser({
    _id: userId,
    username,
  });

  newUser.save((err, doc) => {
    if (err) return console.error(err);
    res.json({
      _id: newUser._id,
      username: newUser.username,
    });
  });
});

app.get("/api/exercise/users", async (req, res) => {
  res.json(await NewUser.find({}));
});

app.post("/api/exercise/add", async (req, res) => {
  const { userId, description, duration, date } = req.body;
  const allUsers = await NewUser.find({});

  const newExercise = new NewExercise({
    _id: userId,
    username: await allUsers.find(user => user._id === userId).username,
    date: date === "" ? new Date() : new Date(date),
    duration,
    description,
  });

  newExercise.save((err, doc) => {
    if (err) return console.error(err);
    res.json({
      _id: newExercise._id,
      username: newExercise.username,
      date: newExercise.date,
      duration: newExercise.duration,
      description: newExercise.description,
    });
  });
});

app.get("/api/exercise/log", (req, res) => {});

const listener = app.listen(port, () => {
  console.log("Your app is listening on port " + port);
});
