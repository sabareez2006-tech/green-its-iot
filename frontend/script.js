/* =========================
   GLOBAL VARIABLES
========================= */
let emergency = false;
let totalFuelSaved = 0;
let totalCO2Reduced = 0;
let time = 0;

const BACKEND_URL = "https://green-its-iot.onrender.com";


const labels = [];
const trafficData = [];
const co2Data = [];

/* =========================
   SIGNAL LOGIC
========================= */
function signalLogic(traffic) {
  if (emergency) return "GREEN – Emergency Priority";
  if (traffic === "High") return "Green (Extended)";
  if (traffic === "Medium") return "Normal";
  return "Red (Short)";
}

/* =========================
   GREEN IMPACT
========================= */
function calculateGreenImpact(traffic) {
  let fuelSaved = 0;
  let co2Saved = 0;

  if (traffic === "High") {
    fuelSaved = 0.5;
    co2Saved = 1.2;
  } else if (traffic === "Medium") {
    fuelSaved = 0.3;
    co2Saved = 0.8;
  } else {
    fuelSaved = 0.1;
    co2Saved = 0.3;
  }

  totalFuelSaved += fuelSaved;
  totalCO2Reduced += co2Saved;

  document.getElementById("fuel").innerText =
    totalFuelSaved.toFixed(1) + " L";
  document.getElementById("co2").innerText =
    totalCO2Reduced.toFixed(1) + " kg";

  return co2Saved;
}

/* =========================
   CHARTS
========================= */
const trafficChart = new Chart(
  document.getElementById("trafficChart"),
  {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Traffic Density (1=Low, 2=Medium, 3=High)",
        data: trafficData,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  }
);

const co2Chart = new Chart(
  document.getElementById("co2Chart"),
  {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "CO₂ Reduction (kg)",
        data: co2Data,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  }
);

/* =========================
   DASHBOARD UPDATE
========================= */
async function updateDashboard() {
  const res = await fetch(`${BACKEND_URL}/api/simulate`);
  const data = await res.json();

  const traffic = data.traffic;
  const pollution = data.pollution + " ppm";
  const signal = signalLogic(traffic);

  document.getElementById("traffic").innerText = traffic;
  document.getElementById("pollution").innerText = pollution;
  document.getElementById("signal").innerText = signal;

  const trafficValue =
    traffic === "Low" ? 1 :
    traffic === "Medium" ? 2 : 3;

  const co2Saved = calculateGreenImpact(traffic);

  time++;
  labels.push(time);
  trafficData.push(trafficValue);
  co2Data.push(co2Saved);

  if (labels.length > 10) {
    labels.shift();
    trafficData.shift();
    co2Data.shift();
  }

  trafficChart.update();
  co2Chart.update();
}

/* =========================
   EMERGENCY BUTTON
========================= */
document.getElementById("emergencyBtn").addEventListener("click", () => {
  emergency = true;
  document.getElementById("signal").innerText =
    "GREEN – Emergency Priority";

  setTimeout(() => {
    emergency = false;
  }, 5000);
});

/* =========================
   RESET BUTTON (FRONTEND)
========================= */
document.getElementById("resetBtn").addEventListener("click", () => {
  emergency = false;
  totalFuelSaved = 0;
  totalCO2Reduced = 0;
  time = 0;

  labels.length = 0;
  trafficData.length = 0;
  co2Data.length = 0;

  document.getElementById("fuel").innerText = "0 L";
  document.getElementById("co2").innerText = "0 kg";
  document.getElementById("traffic").innerText = "Reset";
  document.getElementById("pollution").innerText = "Reset";
  document.getElementById("signal").innerText = "Normal";

  trafficChart.update();
  co2Chart.update();
});

/* =========================
   MANUAL MODE
========================= */
document.getElementById("applyManual").addEventListener("click", async () => {
  const traffic = document.getElementById("manualTraffic").value;
  const pollution = document.getElementById("manualPollution").value;

  await fetch(`${BACKEND_URL}/api/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ traffic, pollution })
  });

  alert("Manual data applied");
});

/* =========================
   AUTO MODE
========================= */
document.getElementById("autoMode").addEventListener("click", async () => {
  await fetch(`${BACKEND_URL}/api/reset`, { method: "POST" });
  alert("Auto mode enabled");
});

/* =========================
   START SIMULATION
========================= */
setInterval(updateDashboard, 2000);
updateDashboard();
