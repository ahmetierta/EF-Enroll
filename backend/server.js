const express = require("express");
const cors = require("cors");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);

app.get("/", (req, res) => {
  res.send("Backend po punon");
});

app.listen(5000, () => {
  console.log("Serveri po punon ne portin 5000");
});
