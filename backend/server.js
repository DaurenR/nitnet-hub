const express = require("express");
const cors = require("cors");
const mcriapRoutes = require("./routes/mcriap");
const mioRoutes = require("./routes/mio");

const app = express();

app.use(cors());
app.use(express.json());
app.use(require("./middleware/role"));

app.use("/mcriap", mcriapRoutes);
app.use("/mio", mioRoutes);

app.use((req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, _req, res, _next) =>
  res.status(500).json({ error: err.message || "Internal Server Error" })
);



app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
