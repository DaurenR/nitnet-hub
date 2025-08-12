const express = require("express");
const cors = require("cors");
const mciriapRoutes = require("./routes/mcriap");
const mioRoutes = require("./routes/mio");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/mciriap", mciriapRoutes);
app.use("/mio", mioRoutes);


app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
