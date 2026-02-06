const STORAGE_KEY = "city-game-save";

const defaultState = {
  accountName: "Gracz",
  cities: [
    createCity("Miasto Alfa"),
    createCity("Miasto Bravo"),
    createCity("Miasto Delta"),
  ],
  activeCityId: null,
  alerts: [],
  radar: [],
  enemyWave: 1,
};

const shopItems = [
  {
    id: "airbase",
    name: "Lotnisko wojskowe",
    description: "Bazuje myśliwce i drony zwiadowcze.",
    cost: 1200,
    defense: 4,
    tags: ["Infrastruktura", "Lotnictwo"],
  },
  {
    id: "f16",
    name: "Eskadra F-16",
    description: "Szybki przechwyt, dobra skuteczność.",
    cost: 900,
    defense: 3,
    tags: ["Lotnictwo", "Myśliwce"],
  },
  {
    id: "f35",
    name: "Eskadra F-35",
    description: "Stealth, trudny do wykrycia.",
    cost: 1400,
    defense: 5,
    tags: ["Lotnictwo", "Stealth"],
  },
  {
    id: "tank",
    name: "Batalion czołgów",
    description: "Nowoczesne czołgi z aktywną osłoną.",
    cost: 800,
    defense: 4,
    tags: ["Ląd", "Ciężkie"],
  },
  {
    id: "sam",
    name: "Systemy przeciwlotnicze",
    description: "Obrona przed samolotami i rakietami.",
    cost: 1100,
    defense: 5,
    tags: ["Obrona", "AA"],
  },
  {
    id: "walls",
    name: "Mury i bunkry",
    description: "Wzmacnia granice i bazę.",
    cost: 500,
    defense: 2,
    tags: ["Obrona", "Infrastruktura"],
  },
  {
    id: "missiles",
    name: "Bateria rakietowa",
    description: "Uderzenia precyzyjne dalekiego zasięgu.",
    cost: 1300,
    defense: 4,
    tags: ["Rakiety", "Uderzeniowe"],
  },
  {
    id: "radar",
    name: "Radar strategiczny",
    description: "Wykrywa wrogie jednostki z 3 kierunków.",
    cost: 700,
    defense: 2,
    tags: ["Wywiad", "Radar"],
  },
];

const enemyUnits = [
  { id: "enemy-f16", name: "Wrogi F-16", type: "air", stealth: false },
  { id: "enemy-f35", name: "Wrogi F-35", type: "air", stealth: true },
  { id: "enemy-tank", name: "Wrogie czołgi", type: "land", stealth: false },
  { id: "enemy-ship", name: "Wrogi niszczyciel", type: "sea", stealth: false },
  { id: "enemy-drone", name: "Dron stealth", type: "air", stealth: true },
];

const elements = {
  cityList: document.getElementById("city-list"),
  cityName: document.getElementById("city-name"),
  cityDesc: document.getElementById("city-desc"),
  budget: document.getElementById("budget"),
  defense: document.getElementById("defense"),
  threat: document.getElementById("threat"),
  alerts: document.getElementById("alerts"),
  shopGrid: document.getElementById("shop-grid"),
  assetsGrid: document.getElementById("assets-grid"),
  radarList: document.getElementById("radar-list"),
  scan: document.getElementById("scan"),
  addCity: document.getElementById("add-city"),
  resetSave: document.getElementById("reset-save"),
  accountName: document.getElementById("account-name"),
};

let state = loadState();

function createCity(name) {
  return {
    id: `city-${crypto.randomUUID()}`,
    name,
    budget: 5000,
    defense: 2,
    assets: [],
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = { ...defaultState };
    seeded.activeCityId = seeded.cities[0].id;
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.activeCityId && parsed.cities?.length) {
      parsed.activeCityId = parsed.cities[0].id;
    }
    return parsed;
  } catch (error) {
    console.error("Nie udało się wczytać zapisu", error);
    const seeded = { ...defaultState };
    seeded.activeCityId = seeded.cities[0].id;
    return seeded;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveCity() {
  return state.cities.find((city) => city.id === state.activeCityId);
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
  elements.threat.textContent = threatLabel(city.defense);
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
  elements.shopGrid.innerHTML = "";
  shopItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
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
    `;
    const button = document.createElement("button");
    button.textContent = "Kup";
    button.addEventListener("click", () => buyItem(item));
    card.appendChild(button);
    elements.shopGrid.appendChild(card);
  });
}

function renderAssets() {
  const city = getActiveCity();
  elements.assetsGrid.innerHTML = "";
  if (!city.assets.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = "<p class=\"muted\">Brak aktywów. Kup jednostki i infrastruktury.</p>";
    elements.assetsGrid.appendChild(empty);
    return;
  }
  city.assets.forEach((asset) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>
        <h4>${asset.name}</h4>
        <p class="muted">${asset.description}</p>
      </div>
      <div class="asset-tags">
        ${asset.tags.map((tag) => `<span class="asset-tag">${tag}</span>`).join("")}
      </div>
      <div>
        <strong>Wartość obronna: +${asset.defense}</strong>
      </div>
    `;
    elements.assetsGrid.appendChild(card);
  });
}

function renderRadar() {
  elements.radarList.innerHTML = "";
  if (!state.radar.length) {
    const empty = document.createElement("li");
    empty.textContent = "Brak wykryć. Użyj skanu.";
    elements.radarList.appendChild(empty);
    return;
  }
  state.radar.forEach((unit) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${unit.name}</span><span>${unit.distance} km</span>`;
    elements.radarList.appendChild(li);
  });
}

function threatLabel(defense) {
  if (defense >= 16) return "Niski";
  if (defense >= 10) return "Średni";
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
  if (city.budget < item.cost) {
    addAlert(`Brak budżetu na ${item.name}.`);
    renderAlerts();
    return;
  }
  city.budget -= item.cost;
  city.defense += item.defense;
  city.assets.push({ ...item });
  addAlert(`Zakupiono ${item.name} w ${city.name}.`);
  saveState();
  render();
}

function scanRadar() {
  const detected = [];
  const sample = [...enemyUnits]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3 + Math.floor(Math.random() * 3));
  sample.forEach((unit) => {
    if (unit.stealth) {
      addAlert(`Radar nie wykrył jednostki stealth (${unit.name}).`);
      return;
    }
    detected.push({
      name: unit.name,
      distance: 20 + Math.floor(Math.random() * 80),
    });
  });
  state.radar = detected;
  addAlert("Zaktualizowano dane radaru.");
  saveState();
  renderRadar();
  renderAlerts();
}

function spawnEnemyWave() {
  const enemy = enemyUnits[Math.floor(Math.random() * enemyUnits.length)];
  const city = getActiveCity();
  const defenseRoll = city.defense + Math.floor(Math.random() * 6);
  const attackRoll = 8 + state.enemyWave;
  if (defenseRoll >= attackRoll) {
    addAlert(`Obrona ${city.name} odparła atak: ${enemy.name}.`);
  } else {
    const loss = 200 + Math.floor(Math.random() * 200);
    city.budget = Math.max(0, city.budget - loss);
    addAlert(`Atak ${enemy.name} przebił obronę. Straty: -${loss} CR.`);
  }
  state.enemyWave += 1;
  saveState();
  render();
}

function addCity() {
  const name = prompt("Nazwa nowego miasta:");
  if (!name) return;
  const city = createCity(name);
  state.cities.push(city);
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

function render() {
  renderCities();
  renderOverview();
  renderAlerts();
  renderShop();
  renderAssets();
  renderRadar();
}

elements.scan.addEventListener("click", scanRadar);
elements.addCity.addEventListener("click", addCity);
elements.resetSave.addEventListener("click", resetSave);

render();
setInterval(spawnEnemyWave, 45000);
