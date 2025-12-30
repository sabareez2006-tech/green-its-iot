const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const path = require("path");
const STATE_FILE = path.join(__dirname, "state.json");


// Initialize state file if not exists
if (!fs.existsSync(STATE_FILE)) {
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify({ mode: "auto", traffic: "Low", pollution: 100 })
  );
}

// Helper functions
function readState() {
  return JSON.parse(fs.readFileSync(STATE_FILE));
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

// Root
app.get("/", (req, res) => {
  res.send("Green ITS Backend Running");
});

// Simulation API
app.get("/api/simulate", (req, res) => {
  const state = readState();

  if (state.mode === "manual") {
    return res.json({
      traffic: state.traffic,
      pollution: state.pollution,
      mode: "manual"
    });
  }

  const levels = ["Low", "Medium", "High"];
  const traffic = levels[Math.floor(Math.random() * 3)];
  const pollution = Math.floor(Math.random() * 200 + 100);

  res.json({
    traffic,
    pollution,
    mode: "auto"
  });
});

// Manual mode
app.post("/api/manual", (req, res) => {
  const { traffic, pollution } = req.body;

  writeState({
    mode: "manual",
    traffic,
    pollution
  });

  console.log("✅ MANUAL MODE SAVED:", traffic, pollution);
  res.json({ status: "Manual mode ON" });
});

// Reset to auto
app.post("/api/reset", (req, res) => {
  writeState({
    mode: "auto",
    traffic: "Low",
    pollution: 100
  });

  console.log("🔄 AUTO MODE ENABLED");
  res.json({ status: "Auto mode ON" });
});

app.listen(PORT, () => {
  console.log(`🔥 Backend running on http://localhost:${PORT}`);
});
