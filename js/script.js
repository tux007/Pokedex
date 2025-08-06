const typeColors = {
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  poison: "#A040A0",
  bug: "#A8B820",
  normal: "#A8A878",
  flying: "#A890F0",
  ground: "#E0C068",
  fairy: "#EE99AC",
  fighting: "#C03028",
  psychic: "#F85888",
  rock: "#B8A038",
  ghost: "#705898",
  ice: "#98D8D8",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
};

const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon";

let offset = 0;
let currentPokemons = [];
let allLoadedPokemons = [];
let allPokemonNames = [];

const startBtn = document.getElementById("startBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const spinner = document.getElementById("spinner");
const grid = document.getElementById("pokemonGrid");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const logoTitle = document.querySelector(".logo-title");

startBtn.addEventListener("click", goToStart);
prevBtn.addEventListener("click", loadPreviousPokemons);
nextBtn.addEventListener("click", loadNextPokemons);

logoTitle.addEventListener("click", () => {
  location.reload();
});

clearBtn.addEventListener("click", () => {
  resetSearch();
});

async function loadAllPokemonNames() {
  try {
    const res = await fetch(`${API_BASE_URL}?limit=10000`);
    const data = await res.json();
    allPokemonNames = data.results;
  } catch (error) {
    console.error("Failed to load Pokemon names:", error);
  }
}

searchInput.addEventListener("input", () => {
  const hasValue = searchInput.value.trim().length > 0;
  searchBtn.disabled = searchInput.value.trim().length < 3;
  clearBtn.style.display = hasValue ? "flex" : "none";

  if (searchInput.value === "") {
    resetSearch();
  }
});

searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query.length >= 3) {
    grid.innerHTML = "";
    spinner.style.display = "block";

    try {
      const matchingPokemons = allPokemonNames.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(query)
      );

      if (matchingPokemons.length === 0) {
        alert("No Pokemon found matching your search");
        return;
      }

      currentPokemons = [];
      const pokemonsToLoad = matchingPokemons.slice(0, 20);
      for (let pokemon of pokemonsToLoad) {
        const pokeData = await fetch(pokemon.url).then((res) => res.json());
        currentPokemons.push(pokeData);
        renderCard(pokeData);
      }
      startBtn.style.display = "none";
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    } catch (e) {
      alert("Error searching for Pokemon");
    } finally {
      spinner.style.display = "none";
    }
  }
});

async function loadCurrentPage() {
  currentPokemons = [];
  const res = await fetch(`${API_BASE_URL}?offset=${offset}&limit=20`);
  const data = await res.json();

  for (let item of data.results) {
    const pokeData = await fetch(item.url).then((res) => res.json());
    currentPokemons.push(pokeData);
    renderCard(pokeData);
  }
}

async function loadNextPokemons() {
  nextBtn.disabled = true;
  spinner.style.display = "block";
  const res = await fetch(`${API_BASE_URL}?offset=${offset}&limit=20`);
  const data = await res.json();
  currentPokemons = [];
  grid.innerHTML = "";
  for (let item of data.results) {
    const pokeData = await fetch(item.url).then((res) => res.json());
    currentPokemons.push(pokeData);
    allLoadedPokemons.push(pokeData);
    renderCard(pokeData);
  }
  offset += 20;
  updateButtonStates();
  spinner.style.display = "none";
  nextBtn.disabled = false;
}

async function loadPreviousPokemons() {
  if (offset <= 0) return;

  prevBtn.disabled = true;
  spinner.style.display = "block";

  offset -= 20;
  const res = await fetch(`${API_BASE_URL}?offset=${offset}&limit=20`);
  const data = await res.json();

  currentPokemons = [];
  grid.innerHTML = "";

  for (let item of data.results) {
    const pokeData = await fetch(item.url).then((res) => res.json());
    currentPokemons.push(pokeData);
    renderCard(pokeData);
  }

  updateButtonStates();
  spinner.style.display = "none";
  prevBtn.disabled = false;
}

function goToStart() {
  offset = 0;
  grid.innerHTML = "";
  loadCurrentPage();
  updateButtonStates();
}

function updateButtonStates() {
  prevBtn.disabled = offset <= 0;
  startBtn.disabled = offset <= 0;
}

function renderCard(poke) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  const types = poke.types.map((t) => t.type.name);
  const mainType = types[0];
  const bgColor = typeColors[mainType] || "#ddd";
  card.style.backgroundColor = bgColor + "88";

  card.innerHTML = createPokemonCardTemplate(poke, typeColors);

  card.addEventListener("click", () => showModal(poke));
  grid.appendChild(card);
}

let currentModalIndex = 0;

function showModal(poke) {
  currentModalIndex = currentPokemons.findIndex((p) => p.id === poke.id);
  renderModal(poke);
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.style.display = "none";
  document.body.style.overflow = "";
}

function renderModal(poke) {
  modalContent.innerHTML = createModalTemplate(poke);
}

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.getElementById("prev").addEventListener("click", () => {
  if (currentModalIndex > 0) {
    currentModalIndex--;
    renderModal(currentPokemons[currentModalIndex]);
  }
});

document.getElementById("next").addEventListener("click", () => {
  if (currentModalIndex < currentPokemons.length - 1) {
    currentModalIndex++;
    renderModal(currentPokemons[currentModalIndex]);
  }
});

function resetSearch() {
  searchInput.value = "";
  searchBtn.disabled = true;
  clearBtn.style.display = "none";
  startBtn.style.display = "inline-block";
  prevBtn.style.display = "inline-block";
  nextBtn.style.display = "inline-block";
  grid.innerHTML = "";
  loadCurrentPage();
}

loadAllPokemonNames();
loadNextPokemons();