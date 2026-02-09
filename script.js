let creatures = [];
let model;
let maxPredictions;

// Elementi UI
const startCameraButton = document.getElementById('startCameraButton');
const scanButton = document.getElementById('scanButton');
const messageEl = document.getElementById('message');

const videoEl = document.getElementById('cameraStream');
const canvasEl = document.getElementById('captureCanvas');
const ctx = canvasEl.getContext('2d');

// Elementi scheda
const cardEl = document.getElementById('creatureCard');
const nameEl = document.getElementById('creatureName');
const typeEl = document.getElementById('creatureType');
const habitatEl = document.getElementById('creatureHabitat');
const abilitiesEl = document.getElementById('creatureAbilities');
const loreEl = document.getElementById('creatureLore');
const imgEl = document.getElementById('creatureImage');
const statHPEl = document.getElementById('statHP');
const statStrenghtEl = document.getElementById('statStrenght');
const statDexterityEl = document.getElementById('statDexterity');
const statVitalityEl = document.getElementById('statVitality');
const statSpecialEl = document.getElementById('statSpecial');
const statInsightEl = document.getElementById('statInsight');

// Carica database creature
fetch('creatures.json')
  .then(res => res.json())
  .then(data => creatures = data);

// Carica modello TM
async function loadModel() {
  const URL = "./model/";
  model = await tmImage.load(URL + "model.json", URL + "metadata.json");
  maxPredictions = model.getTotalClasses();
}

// Attiva fotocamera
startCameraButton.addEventListener('click', async () => {
  alert("Click ricevuto!");

  try {
    await loadModel();
    alert("Modello caricato!");
  } catch (e) {
    alert("Errore nel modello: " + e);
    return;
  }

  alert("Provo ad aprire la fotocamera...");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });

  videoEl.srcObject = stream;
  scanButton.disabled = false;
  messageEl.textContent = "Fotocamera attiva. Inquadra una creatura.";
});

// Scansione
scanButton.addEventListener('click', async () => {
  if (!videoEl.srcObject) return;

  messageEl.textContent = "Analisi in corso...";

  // Cattura fotogramma
  canvasEl.width = 224;
  canvasEl.height = 224;
  ctx.drawImage(videoEl, 0, 0, 224, 224);

  const prediction = await model.predict(canvasEl);

  // Trova la classe con probabilità più alta
  let best = prediction[0];
  for (let p of prediction) {
    if (p.probability > best.probability) best = p;
  }

  const creatureName = best.className;

  // Trova la creatura nel tuo JSON
  const matched = creatures.find(c => c.name === creatureName || c.id === creatureName);

  if (!matched) {
    messageEl.textContent = "Nessuna creatura riconosciuta.";
    cardEl.hidden = true;
    return;
  }

  showCreatureCard(matched);
  messageEl.textContent = "Creatura riconosciuta!";
});

// Mostra scheda
function showCreatureCard(creature) {
  nameEl.textContent = creature.name;
  typeEl.textContent = creature.type;
  habitatEl.textContent = creature.habitat;
  abilitiesEl.textContent = creature.abilities.join(', ');
  loreEl.textContent = creature.lore;
  imgEl.src = creature.image;

  statHPEl.textContent = creature.stats.hp;
  statStrenghtEl.textContent = creature.stats.strenght;
  statDexterityEl.textContent = creature.stats.dexterity;
  statVitalityEl.textContent = creature.stats.vitality;
  statSpecialEl.textContent = creature.stats.special;
  statInsightEl.textContent = creature.stats.insight;

  cardEl.hidden = false;
}
