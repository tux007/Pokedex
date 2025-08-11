function createPokemonCardTemplate(poke, typeColors) {
  const types = poke.types.map((t) => t.type.name);

  return `
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
}

function createModalTemplate(poke) {
  const abilities = poke.abilities.map(ability => ability.ability.name).join(', ');
  const heightInMeters = (poke.height / 10).toFixed(1);
  const weightInKg = (poke.weight / 10).toFixed(1);
  
  return `
    <div class="close-modal" onclick="closeModal()">×</div>
    <h2>${poke.name.toUpperCase()}</h2>
    <img src="${poke.sprites.front_default}" alt="${poke.name}">
    <p><strong>Height:</strong> ${heightInMeters} m</p>
    <p><strong>Weight:</strong> ${weightInKg} kg</p>
    <p><strong>Abilities:</strong> ${abilities}</p>
    <p><strong>HP:</strong> ${poke.stats[0].base_stat}</p>
    <p><strong>Attack:</strong> ${poke.stats[1].base_stat}</p>
    <p><strong>Defense:</strong> ${poke.stats[2].base_stat}</p>
  `;
}
