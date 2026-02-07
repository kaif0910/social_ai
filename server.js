const express = require("express");
const cors = require("cors");
require("dotenv").config();

const campaignRoutes = require("./src/campaigns/routes");



const app = express();
app.use(cors());
app.use(express.json());
const postRoutes = require("./src/posts/routes");
app.use("/posts", postRoutes);



const analyzeRoutes = require("./src/analyze/routes");
app.use("/analyze", analyzeRoutes);



app.get("/", (req, res) => {
  res.send("Social AI Manager running 🚀");//health check
});

app.use("/campaigns", campaignRoutes);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
