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
let allPokemons = [];
let currentModalIndex = 0;
let loadedCount = 0;
const PAGE_SIZE = 20;
const LOAD_BATCH_SIZE = 100;
let lastOffsetBeforeSearch = 0;
let isSearchActive = false;
let searchPokemons = [];

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

function initEventListeners() {
  startBtn.addEventListener("click", goToStart);
  prevBtn.addEventListener("click", loadPreviousPokemons);
  nextBtn.addEventListener("click", loadNextPokemons);
  logoTitle.addEventListener("click", () => location.reload());
  clearBtn.addEventListener("click", () => resetSearch());
  searchInput.addEventListener("input", handleSearchInput);
  searchBtn.addEventListener("click", handleSearch);
  modal.addEventListener("click", handleModalClick);
  document
    .getElementById("prev")
    .addEventListener("click", showPreviousPokemon);
  document.getElementById("next").addEventListener("click", showNextPokemon);
}

function setAllButtonsDisabled(disabled) {
  startBtn.disabled = disabled;
  prevBtn.disabled = disabled;
  nextBtn.disabled = disabled;
  searchBtn.disabled = disabled;
  clearBtn.disabled = disabled;
}

async function loadAllPokemons(start = 0, count = LOAD_BATCH_SIZE) {
  setAllButtonsDisabled(true);
  showSpinner();
  try {
    const res = await fetch(`${API_BASE_URL}?offset=${start}&limit=${count}`);
    const data = await res.json();
    allPokemonNames = data.results;
    // Lade alle Details inkl. Fotos
    for (let i = 0; i < allPokemonNames.length; i++) {
      const pokeData = await fetch(allPokemonNames[i].url).then((res) =>
        res.json()
      );
      allPokemons.push(pokeData);
    }
    loadedCount += allPokemonNames.length;
  } catch (error) {
    console.error("Failed to load Pokemons:", error);
  }
  hideSpinner();
  setAllButtonsDisabled(false);
}

function handleSearchInput() {
  const hasValue = searchInput.value.trim().length > 0;
  searchBtn.disabled = searchInput.value.trim().length < 3;
  clearBtn.style.display = hasValue ? "flex" : "none";

  if (searchInput.value === "") {
    offset = lastOffsetBeforeSearch;
    resetSearch();
  }
}

async function handleSearch() {
  lastOffsetBeforeSearch = offset;
  isSearchActive = true;
  searchPokemons = [];
  const query = searchInput.value.trim().toLowerCase();
  if (query.length < 3) return;

  showSpinner();
  grid.innerHTML = "";

  try {
    if (!window._allNames) {
      const res = await fetch(`${API_BASE_URL}?limit=10000`);
      const data = await res.json();
      window._allNames = data.results;
    }
    const allNames = window._allNames;
    const matchingPokemons = allNames.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query)
    );
    if (matchingPokemons.length === 0) {
      alert("No Pokemon found matching your search");
      return;
    }
    for (let i = 0; i < matchingPokemons.length; i++) {
      let poke = allPokemons.find(p => p.name === matchingPokemons[i].name);
      if (!poke) {
        poke = await fetch(matchingPokemons[i].url).then(res => res.json());
      }
      searchPokemons.push(poke);
    }
    currentPokemons = searchPokemons.slice(0, 20);
    grid.innerHTML = "";
    currentPokemons.forEach(renderCard);
    hideNavigationButtons();
  } catch (e) {
    alert("Error searching for Pokemon");
  } finally {
    hideSpinner();
  }
}

function hideNavigationButtons() {
  startBtn.style.display = "none";
  prevBtn.style.display = "none";
  nextBtn.style.display = "none";
}

function showNavigationButtons() {
  startBtn.style.display = "inline-block";
  prevBtn.style.display = "inline-block";
  nextBtn.style.display = "inline-block";
}

function loadCurrentPage() {
  currentPokemons = [];
  grid.innerHTML = "";
  const start = offset;
  const end = Math.min(offset + PAGE_SIZE, allPokemons.length);
  for (let i = start; i < end; i++) {
    currentPokemons.push(allPokemons[i]);
    renderCard(allPokemons[i]);
  }
  updateButtonStates();
}

async function loadNextPokemons() {
  nextBtn.disabled = true;
  showSpinner();
  offset += PAGE_SIZE;
  if (offset + PAGE_SIZE > allPokemons.length) {
    loadAllPokemons(loadedCount, LOAD_BATCH_SIZE).then(() => {
      loadCurrentPage();
      hideSpinner();
      nextBtn.disabled = false;
    });
  } else {
    loadCurrentPage();
    hideSpinner();
    nextBtn.disabled = false;
  }
}

async function loadPreviousPokemons() {
  if (offset <= 0) return;
  prevBtn.disabled = true;
  showSpinner();
  offset -= PAGE_SIZE;
  loadCurrentPage();
  hideSpinner();
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
  const types = poke.types.map(t => t.type.name);
  const mainType = types[0];
  const bgColor = typeColors[mainType] || "#ddd";
  card.style.backgroundColor = bgColor + "88";
  const typesHtml = types.map(t => `<span class="type" style="background:${typeColors[t] || '#888'}">${t}</span>`).join("");
  poke.typesHtml = typesHtml;

  card.innerHTML = createPokemonCardTemplate(poke, typeColors);
  card.addEventListener("click", () => showModal(poke));
  grid.appendChild(card);
}

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

function handleModalClick(e) {
  if (e.target === modal) closeModal();
}

function showPreviousPokemon() {
  if (currentModalIndex > 0) {
    currentModalIndex--;
    renderModal(currentPokemons[currentModalIndex]);
  }
}

function showNextPokemon() {
  if (currentModalIndex < currentPokemons.length - 1) {
    currentModalIndex++;
    renderModal(currentPokemons[currentModalIndex]);
  }
}

function resetSearch() {
  searchInput.value = "";
  searchBtn.disabled = true;
  clearBtn.style.display = "none";
  showNavigationButtons();
  loadCurrentPage();
}

function showSpinner() {
  spinner.style.display = "block";
}

function hideSpinner() {
  spinner.style.display = "none";
}

function init() {
  initEventListeners();
  offset = 0;
  loadedCount = 0;
  allPokemons = [];
  loadAllPokemons(0, LOAD_BATCH_SIZE).then(() => {
    loadCurrentPage();
  });
}

init();
