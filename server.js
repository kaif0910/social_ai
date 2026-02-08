const express = require("express");
const cors = require("cors");
require("dotenv").config();

const campaignRoutes = require("./src/campaigns/routes");



const app = express();
app.use(cors());
app.use(express.json());
const postRoutes = require("./src/posts/routes");
const projectRoutes = require("./src/projects/routes");
const copilotRoutes = require("./src/copilot/routes");
app.use("/projects", projectRoutes);
app.use("/posts", postRoutes);
app.use("/copilot", copilotRoutes);

const postFeedbackRoutes = require("./src/postFeedback/routes");
app.use("/analyze/post", postFeedbackRoutes);


const analyzeRoutes = require("./src/analyze/routes");
app.use("/analyze", analyzeRoutes);



app.get("/", (req, res) => {
  res.send("Social AI Manager running 🚀");//health check
});

app.use("/campaigns", campaignRoutes);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
