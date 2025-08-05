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

let offset = 0;
let allPokemons = [];

const loadBtn = document.getElementById("loadBtn");
const spinner = document.getElementById("spinner");
const grid = document.getElementById("pokemonGrid");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

loadBtn.addEventListener("click", loadPokemons);

searchInput.addEventListener("input", () => {
  searchBtn.disabled = searchInput.value.trim().length < 3;
});

searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query.length >= 3) {
    grid.innerHTML = "";
    spinner.style.display = "block";
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      const pokeData = await res.json();
      allPokemons = [pokeData];
      renderCard(pokeData);
    } catch (e) {
      alert("Pokémon not found");
    } finally {
      spinner.style.display = "none";
    }
  }
});

async function loadPokemons() {
  loadBtn.disabled = true;
  spinner.style.display = "block";
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=20`
  );
  const data = await res.json();

  for (let item of data.results) {
    const pokeData = await fetch(item.url).then((res) => res.json());
    allPokemons.push(pokeData);
    renderCard(pokeData);
  }
  offset += 20;
  spinner.style.display = "none";
  loadBtn.disabled = false;
}

function renderCard(poke) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  const types = poke.types.map((t) => t.type.name);
  const mainType = types[0];
  const bgColor = typeColors[mainType] || "#ddd";
  card.style.backgroundColor = bgColor + "88";

  card.innerHTML = `
        <img src="${poke.sprites.front_default}" alt="${poke.name}">
        <div class="pokemon-name">${poke.name.toUpperCase()}</div>
        <div class="types">
          ${types
            .map(
              (t) =>
                `<span class="type" style="background:${typeColors[t]}">${t}</span>`
            )
            .join("")}
        </div>
        <div>ID: ${poke.id}</div>
      `;

  card.addEventListener("click", () => showModal(poke));
  grid.appendChild(card);
}

let currentModalIndex = 0;

function showModal(poke) {
  currentModalIndex = allPokemons.findIndex((p) => p.id === poke.id);
  renderModal(poke);
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.style.display = "none";
  document.body.style.overflow = "";
}

function renderModal(poke) {
  modalContent.innerHTML = `
        <div class="close-modal" onclick="closeModal()">×</div>
        <h2>${poke.name.toUpperCase()}</h2>
        <img src="${poke.sprites.front_default}" alt="${poke.name}">
        <p><strong>HP:</strong> ${poke.stats[0].base_stat}</p>
        <p><strong>Attack:</strong> ${poke.stats[1].base_stat}</p>
        <p><strong>Defense:</strong> ${poke.stats[2].base_stat}</p>
      `;
}

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.getElementById("prev").addEventListener("click", () => {
  if (currentModalIndex > 0) {
    currentModalIndex--;
    renderModal(allPokemons[currentModalIndex]);
  }
});

document.getElementById("next").addEventListener("click", () => {
  if (currentModalIndex < allPokemons.length - 1) {
    currentModalIndex++;
    renderModal(allPokemons[currentModalIndex]);
  }
});

loadPokemons();
