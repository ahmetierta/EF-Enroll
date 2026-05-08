const express = require("express");
const cors = require("cors");

const AppDataSource = require("./data-source");
const routes = require("./routes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.use(routes);

app.get("/", (req, res) => {
  res.send("Backend po punon");
});

AppDataSource.initialize()
  .then(() => {
    console.log("TypeORM connected");

    app.listen(5000, () => {
      console.log("Serveri po punon ne portin 5000");
    });
  })
  .catch((err) => {
    console.log("Gabim ne lidhje me TypeORM:", err);
  });
