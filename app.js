const STORAGE_KEY = "city-game-save";

const mapPositions = [
  { row: 1, col: 2 },
  { row: 3, col: 8 },
  { row: 5, col: 4 },
  { row: 6, col: 10 },
  { row: 2, col: 6 },
  { row: 4, col: 2 },
  { row: 6, col: 7 },
  { row: 1, col: 9 },
];

const infrastructureItems = [
  {
    id: "airbase",
    name: "Lotnisko wojskowe",
    description: "Obsługuje nowoczesne eskadry i drony zwiadowcze.",
    cost: 1500,
    defense: 5,
    tags: ["Infrastruktura", "Lotnictwo"],
    type: "structure",
  },
  {
    id: "hangar",
    name: "Hangar lotniczy",
    description: "Zapewnia serwis i bazę dla myśliwców.",
    cost: 800,
    defense: 2,
    tags: ["Infrastruktura", "Serwis"],
    type: "structure",
    requires: ["airbase"],
  },
  {
    id: "port",
    name: "Port wojenny",
    description: "Pozwala budować flotę i okręty podwodne.",
    cost: 1700,
    defense: 4,
    tags: ["Infrastruktura", "Marynarka"],
    type: "structure",
  },
  {
    id: "radar",
    name: "Radar strategiczny",
    description: "Wykrywa wrogie jednostki z wielu kierunków.",
    cost: 900,
    defense: 3,
    tags: ["Wywiad", "Radar"],
    type: "structure",
  },
  {
    id: "walls",
    name: "Mury i bunkry",
    description: "Wzmacnia granice i sztab dowodzenia.",
    cost: 600,
    defense: 3,
    tags: ["Obrona", "Infrastruktura"],
    type: "structure",
  },
  {
    id: "sam",
    name: "Systemy przeciwlotnicze",
    description: "Chronią przed lotnictwem i rakietami.",
    cost: 1200,
    defense: 6,
    tags: ["Obrona", "AA"],
    type: "structure",
  },
  {
    id: "missiles",
    name: "Bateria rakietowa",
    description: "Uderzenia precyzyjne dalekiego zasięgu.",
    cost: 1400,
    defense: 5,
    tags: ["Rakiety", "Uderzeniowe"],
    type: "structure",
  },
];

const aircraftModels = [
  ["f16", "F-16 Fighting Falcon"],
  ["f18", "F/A-18 Hornet"],
  ["f15", "F-15 Eagle"],
  ["f35", "F-35 Lightning II"],
  ["f22", "F-22 Raptor"],
  ["su57", "Su-57 Felon"],
  ["su35", "Su-35 Flanker"],
  ["typhoon", "Eurofighter Typhoon"],
  ["rafale", "Dassault Rafale"],
  ["gripen", "JAS 39 Gripen"],
  ["mig35", "MiG-35"],
  ["j20", "Chengdu J-20"],
  ["j31", "Shenyang FC-31"],
  ["b2", "B-2 Spirit"],
  ["b21", "B-21 Raider"],
  ["a10", "A-10 Thunderbolt"],
  ["mq9", "MQ-9 Reaper"],
  ["globalhawk", "RQ-4 Global Hawk"],
  ["awacs", "E-7 Wedgetail"],
  ["k52", "Ka-52 Alligator"],
];

const tankModels = [
  ["abrams", "M1 Abrams"],
  ["leopard2", "Leopard 2A7"],
  ["t14", "T-14 Armata"],
  ["k2", "K2 Black Panther"],
  ["merkava", "Merkava Mk4"],
  ["challenger", "Challenger 3"],
  ["leclerc", "Leclerc XLR"],
  ["type99", "Type 99A"],
  ["altay", "Altay"],
  ["vt4", "VT-4"],
];

const shipModels = [
  ["destroyer", "Niszczyciel Aegis"],
  ["frigate", "Fregata rakietowa"],
  ["corvette", "Korweta stealth"],
  ["carrier", "Lotniskowiec"],
  ["amphib", "Okręt desantowy"],
  ["sub", "Okręt podwodny"],
  ["attacksub", "Atomowy okręt podwodny"],
  ["patrol", "Patrolowiec"],
  ["missileboat", "Kutry rakietowe"],
  ["droneboat", "Drony morskie"],
];

const unitTemplates = [
  ...aircraftModels.map(([id, name], index) => ({
    id: `air-${id}`,
    name,
    description: "Nowoczesna jednostka powietrzna gotowa do patrolu.",
    cost: 900 + index * 40,
    defense: 3 + Math.floor(index / 4),
    tags: ["Lotnictwo", index % 2 === 0 ? "Myśliwiec" : "Wsparcie"],
    type: "unit",
    domain: "air",
    upkeep: 40 + index * 2,
    stealth: ["f35", "f22", "b2", "b21"].includes(id),
    requires: ["airbase", "hangar"],
  })),
  ...tankModels.map(([id, name], index) => ({
    id: `tank-${id}`,
    name,
    description: "Zmodernizowany batalion pancerny.",
    cost: 700 + index * 35,
    defense: 3 + Math.floor(index / 3),
    tags: ["Ląd", "Czołgi"],
    type: "unit",
    domain: "land",
    upkeep: 20 + index,
  })),
  ...shipModels.map(([id, name], index) => ({
    id: `ship-${id}`,
    name,
    description: "Jednostka marynarki z zaawansowanymi sensorami.",
    cost: 1100 + index * 60,
    defense: 4 + Math.floor(index / 3),
    tags: ["Morze", id.includes("sub") ? "Podwodne" : "Flota"],
    type: "unit",
    domain: "sea",
    upkeep: 35 + index * 3,
    requires: ["port"],
  })),
];

const shopItems = [...infrastructureItems, ...unitTemplates];

const enemyUnits = [
  { id: "enemy-f16", name: "Wrogi F-16", domain: "air", stealth: false },
  { id: "enemy-f35", name: "Wrogi F-35", domain: "air", stealth: true },
  { id: "enemy-tank", name: "Wrogie czołgi", domain: "land", stealth: false },
  { id: "enemy-ship", name: "Wrogi niszczyciel", domain: "sea", stealth: false },
  { id: "enemy-sub", name: "Wrogi okręt podwodny", domain: "sea", stealth: true },
  { id: "enemy-drone", name: "Dron stealth", domain: "air", stealth: true },
];

const elements = {
  cityList: document.getElementById("city-list"),
  cityName: document.getElementById("city-name"),
  cityDesc: document.getElementById("city-desc"),
  budget: document.getElementById("budget"),
  defense: document.getElementById("defense"),
  integrity: document.getElementById("integrity"),
  threat: document.getElementById("threat"),
  status: document.getElementById("status"),
  alerts: document.getElementById("alerts"),
  shopGrid: document.getElementById("shop-grid"),
  assetsGrid: document.getElementById("assets-grid"),
  radarList: document.getElementById("radar-list"),
  scan: document.getElementById("scan"),
  addCity: document.getElementById("add-city"),
  resetSave: document.getElementById("reset-save"),
  accountName: document.getElementById("account-name"),
  minimapGrid: document.getElementById("minimap-grid"),
  lossOverlay: document.getElementById("loss-overlay"),
  restartCampaign: document.getElementById("restart-campaign"),
};

const defaultState = {
  accountName: "Gracz",
  cities: [createCity("Miasto Alfa"), createCity("Miasto Bravo"), createCity("Miasto Delta")],
  activeCityId: null,
  alerts: [],
  radar: [],
  enemyWave: 1,
  lastMaintenance: Date.now(),
};

let state = loadState();

function createCity(name) {
  return {
    id: `city-${crypto.randomUUID()}`,
    name,
    budget: 6000,
    defense: 2,
    integrity: 100,
    status: "active",
    assets: [],
    infrastructure: [],
    mapIndex: null,
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = { ...defaultState };
    seeded.activeCityId = seeded.cities[0].id;
    assignMapPositions(seeded.cities);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.activeCityId && parsed.cities?.length) {
      parsed.activeCityId = parsed.cities[0].id;
    }
    parsed.cities.forEach(normalizeCity);
    assignMapPositions(parsed.cities);
    parsed.lastMaintenance = parsed.lastMaintenance || Date.now();
    parsed.alerts = parsed.alerts || [];
    parsed.radar = parsed.radar || [];
    parsed.enemyWave = parsed.enemyWave || 1;
    return parsed;
  } catch (error) {
    console.error("Nie udało się wczytać zapisu", error);
    const seeded = { ...defaultState };
    seeded.activeCityId = seeded.cities[0].id;
    assignMapPositions(seeded.cities);
    return seeded;
  }
}

function normalizeCity(city) {
  city.assets = city.assets || [];
  city.infrastructure = city.infrastructure || [];
  city.integrity = city.integrity ?? 100;
  city.status = city.status || "active";
  city.assets = city.assets.map((asset) => ({
    status: asset.status || "hangar",
    upkeep: asset.upkeep ?? 0,
    domain: asset.domain || "land",
    ...asset,
  }));
}

function assignMapPositions(cities) {
  cities.forEach((city, index) => {
    if (city.mapIndex === null || city.mapIndex === undefined) {
      city.mapIndex = index % mapPositions.length;
    }
  });
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveCity() {
  return state.cities.find((city) => city.id === state.activeCityId);
}

function cityHasInfrastructure(city, requirement) {
  return city.infrastructure.includes(requirement);
}

function meetsRequirements(city, item) {
  if (!item.requires) return true;
  return item.requires.every((requirement) => cityHasInfrastructure(city, requirement));
}

function renderCities() {
  elements.cityList.innerHTML = "";
  state.cities.forEach((city) => {
    const item = document.createElement("li");
    item.textContent = city.name;
    item.classList.toggle("active", city.id === state.activeCityId);
    item.addEventListener("click", () => {
      state.activeCityId = city.id;
      addAlert(`Przełączono na ${city.name}.`);
      saveState();
      render();
    });
    elements.cityList.appendChild(item);
  });
}

function renderOverview() {
  const city = getActiveCity();
  if (!city) return;
  elements.cityName.textContent = city.name;
  elements.cityDesc.textContent = `Budżet operacyjny: ${city.budget} kredytów.`;
  elements.budget.textContent = `${city.budget} CR`;
  elements.defense.textContent = city.defense.toString();
  elements.integrity.textContent = `${city.integrity}%`;
  elements.threat.textContent = threatLabel(city.defense);
  elements.status.textContent = city.status === "lost" ? "Upadło" : "Aktywne";
  elements.accountName.textContent = state.accountName;
}

function renderAlerts() {
  elements.alerts.innerHTML = "";
  state.alerts.slice(0, 6).forEach((alert) => {
    const li = document.createElement("li");
    li.textContent = alert;
    elements.alerts.appendChild(li);
  });
}

function renderShop() {
  const city = getActiveCity();
  elements.shopGrid.innerHTML = "";
  shopItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    const requirements = item.requires?.length
      ? `<div class="status-pill">Wymaga: ${item.requires.join(", ")}</div>`
      : "";
    card.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p class="muted">${item.description}</p>
      </div>
      <div class="asset-tags">
        ${item.tags.map((tag) => `<span class="asset-tag">${tag}</span>`).join("")}
      </div>
      <div>
        <strong>Koszt: ${item.cost} CR</strong>
      </div>
      ${item.upkeep ? `<div class="status-pill">Utrzymanie: ${item.upkeep} CR</div>` : ""}
      ${requirements}
    `;
    const button = document.createElement("button");
    button.textContent = "Kup";
    button.disabled = city.status === "lost";
    button.addEventListener("click", () => buyItem(item));
    card.appendChild(button);
    elements.shopGrid.appendChild(card);
  });
}

function renderAssets() {
  const city = getActiveCity();
  elements.assetsGrid.innerHTML = "";
  if (!city.assets.length && !city.infrastructure.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = "<p class=\"muted\">Brak aktywów. Kup jednostki i infrastruktury.</p>";
    elements.assetsGrid.appendChild(empty);
    return;
  }

  city.infrastructure.forEach((infraId) => {
    const infra = infrastructureItems.find((item) => item.id === infraId);
    if (!infra) return;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>
        <h4>${infra.name}</h4>
        <p class="muted">${infra.description}</p>
      </div>
      <div class="asset-tags">
        ${infra.tags.map((tag) => `<span class="asset-tag">${tag}</span>`).join("")}
      </div>
      <div>
        <strong>Wartość obronna: +${infra.defense}</strong>
      </div>
    `;
    elements.assetsGrid.appendChild(card);
  });

  city.assets.forEach((asset) => {
    const card = document.createElement("div");
    card.className = "card";
    const statusLabel = asset.status === "patrol" ? "Patrol" : asset.status === "deployed" ? "W misji" : "Hangar";
    card.innerHTML = `
      <div>
        <h4>${asset.name}</h4>
        <p class="muted">${asset.description}</p>
      </div>
      <div class="asset-tags">
        ${asset.tags.map((tag) => `<span class="asset-tag">${tag}</span>`).join("")}
      </div>
      <div class="status-pill">Status: ${statusLabel}</div>
      <div>
        <strong>Wartość obronna: +${asset.defense}</strong>
      </div>
    `;
    if (asset.domain === "air") {
      const actions = document.createElement("div");
      actions.className = "asset-actions";
      const button = document.createElement("button");
      button.textContent = asset.status === "patrol" ? "Zakończ patrol" : "Rozpocznij patrol";
      button.addEventListener("click", () => togglePatrol(asset.id));
      actions.appendChild(button);
      card.appendChild(actions);
    }
    elements.assetsGrid.appendChild(card);
  });
}

function renderRadar() {
  elements.radarList.innerHTML = "";
  if (!state.radar.length) {
    const empty = document.createElement("li");
    empty.textContent = "Brak wykryć. Radar skanuje stale.";
    elements.radarList.appendChild(empty);
    return;
  }
  state.radar.forEach((unit) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${unit.name}</span><span>${unit.distance} km</span>`;
    const actions = document.createElement("div");
    actions.className = "asset-actions";
    if (unit.domain === "air") {
      const btn = createDispatchButton("Wyślij patrol", "air", unit.name);
      actions.appendChild(btn);
    }
    if (unit.domain === "land") {
      const btn = createDispatchButton("Wyślij czołgi", "land", unit.name);
      actions.appendChild(btn);
    }
    if (unit.domain === "sea") {
      const btn = createDispatchButton("Wyślij flotę", "sea", unit.name);
      actions.appendChild(btn);
    }
    li.appendChild(actions);
    elements.radarList.appendChild(li);
  });
}

function createDispatchButton(label, domain, targetName) {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", () => dispatchUnit(domain, targetName));
  return button;
}

function renderMinimap() {
  const rows = 8;
  const cols = 12;
  const city = getActiveCity();
  elements.minimapGrid.innerHTML = "";
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const tile = document.createElement("div");
      const isSea = row < 2 || row > 5 || col < 2 || col > 9;
      tile.className = `minimap-tile ${isSea ? "sea" : "land"}`;
      const cityOnTile = state.cities.find((entry) => {
        const pos = mapPositions[entry.mapIndex % mapPositions.length];
        return pos.row === row && pos.col === col;
      });
      if (cityOnTile) {
        tile.classList.add("city");
        if (cityOnTile.id === city.id) {
          tile.style.outline = "2px solid #5e8bff";
        }
      }
      elements.minimapGrid.appendChild(tile);
    }
  }
}

function threatLabel(defense) {
  if (defense >= 24) return "Niski";
  if (defense >= 14) return "Średni";
  return "Wysoki";
}

function addAlert(message) {
  state.alerts.unshift(message);
  if (state.alerts.length > 12) {
    state.alerts.length = 12;
  }
}

function buyItem(item) {
  const city = getActiveCity();
  if (!city || city.status === "lost") return;
  if (!meetsRequirements(city, item)) {
    addAlert(`Brakuje infrastruktury dla ${item.name}.`);
    renderAlerts();
    return;
  }
  if (city.budget < item.cost) {
    addAlert(`Brak budżetu na ${item.name}.`);
    renderAlerts();
    return;
  }
  city.budget -= item.cost;
  city.defense += item.defense;
  if (item.type === "structure") {
    if (!city.infrastructure.includes(item.id)) {
      city.infrastructure.push(item.id);
    } else {
      addAlert(`${item.name} już istnieje w ${city.name}.`);
    }
  } else {
    city.assets.push({
      ...item,
      status: item.domain === "air" ? "hangar" : "ready",
    });
  }
  addAlert(`Zakupiono ${item.name} w ${city.name}.`);
  saveState();
  render();
}

function togglePatrol(assetId) {
  const city = getActiveCity();
  const asset = city.assets.find((entry) => entry.id === assetId);
  if (!asset) return;
  asset.status = asset.status === "patrol" ? "hangar" : "patrol";
  addAlert(
    asset.status === "patrol"
      ? `${asset.name} rozpoczął patrol.`
      : `${asset.name} wrócił do hangaru.`,
  );
  saveState();
  renderAssets();
  renderAlerts();
}

function dispatchUnit(domain, targetName) {
  const city = getActiveCity();
  if (!city || city.status === "lost") return;
  const unit = city.assets.find((asset) => asset.domain === domain);
  if (!unit) {
    addAlert(`Brak dostępnych jednostek dla misji: ${targetName}.`);
    renderAlerts();
    return;
  }
  unit.status = "deployed";
  const outcome = Math.random() > 0.35;
  if (outcome) {
    addAlert(`${unit.name} przechwycił ${targetName}.`);
  } else {
    city.integrity = Math.max(0, city.integrity - 10);
    addAlert(`${unit.name} nie zdołał powstrzymać ${targetName}.`);
  }
  saveState();
  render();
}

function scanRadar() {
  const city = getActiveCity();
  if (!city) return;
  const detected = [];
  const sample = [...enemyUnits]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3 + Math.floor(Math.random() * 3));
  sample.forEach((unit) => {
    if (unit.stealth && !cityHasInfrastructure(city, "radar")) {
      addAlert(`Radar nie wykrył jednostki stealth (${unit.name}).`);
      return;
    }
    detected.push({
      name: unit.name,
      distance: 20 + Math.floor(Math.random() * 80),
      domain: unit.domain,
    });
  });
  state.radar = detected;
  addAlert("Radar zaktualizował sygnały.");
  saveState();
  renderRadar();
  renderAlerts();
}

function applyMaintenance() {
  const city = getActiveCity();
  if (!city || city.status === "lost") return;
  const upkeep = city.assets.reduce((total, asset) => total + (asset.upkeep || 0), 0);
  if (!upkeep) return;
  city.budget = Math.max(0, city.budget - upkeep);
  if (city.budget === 0) {
    city.integrity = Math.max(0, city.integrity - 5);
    addAlert(`Budżet wyczerpany. Utrzymanie osłabia ${city.name}.`);
  } else {
    addAlert(`Opłacono utrzymanie jednostek: -${upkeep} CR.`);
  }
  saveState();
  renderOverview();
  renderAlerts();
}

function spawnEnemyWave() {
  const city = getActiveCity();
  if (!city || city.status === "lost") return;
  const enemy = enemyUnits[Math.floor(Math.random() * enemyUnits.length)];
  const defenseRoll = city.defense + Math.floor(Math.random() * 6);
  const attackRoll = 10 + state.enemyWave;
  if (defenseRoll >= attackRoll) {
    addAlert(`Obrona ${city.name} odparła atak: ${enemy.name}.`);
  } else {
    const loss = 200 + Math.floor(Math.random() * 300);
    city.budget = Math.max(0, city.budget - loss);
    city.integrity = Math.max(0, city.integrity - 15);
    addAlert(`Atak ${enemy.name} przebił obronę. Straty: -${loss} CR.`);
  }
  if (city.integrity === 0) {
    city.status = "lost";
    addAlert(`${city.name} upadło. Wybierz inne miasto.`);
  }
  state.enemyWave += 1;
  saveState();
  render();
  updateLossOverlay();
}

function addCity() {
  const name = prompt("Nazwa nowego miasta:");
  if (!name) return;
  const city = createCity(name);
  state.cities.push(city);
  assignMapPositions(state.cities);
  state.activeCityId = city.id;
  addAlert(`Utworzono ${name}.`);
  saveState();
  render();
}

function resetSave() {
  if (!confirm("Na pewno usunąć zapis?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = loadState();
  addAlert("Przywrócono zapis początkowy.");
  saveState();
  render();
}

function updateLossOverlay() {
  const allLost = state.cities.every((city) => city.status === "lost");
  elements.lossOverlay.classList.toggle("active", allLost);
}

function render() {
  renderCities();
  renderOverview();
  renderAlerts();
  renderShop();
  renderAssets();
  renderRadar();
  renderMinimap();
  updateLossOverlay();
}

elements.scan.addEventListener("click", scanRadar);
elements.addCity.addEventListener("click", addCity);
elements.resetSave.addEventListener("click", resetSave);
elements.restartCampaign.addEventListener("click", resetSave);

render();
setInterval(spawnEnemyWave, 45000);
setInterval(scanRadar, 12000);
setInterval(applyMaintenance, 30000);
