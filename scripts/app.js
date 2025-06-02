let offset = 0;
const limit = 20;
const apiBase = 'https://pokeapi.co/api/v2/pokemon';
let isLoading = false;
let loadedPokemon = new Set();

const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD'
};

function loadPokemonBatch(offset, batchSize) {
  isLoading = true;
  $.getJSON(`${apiBase}?offset=${offset}&limit=${batchSize}`, function (data) {
    const newRequests = data.results
      .filter(pokemon => !loadedPokemon.has(pokemon.name))
      .map(pokemon => {
        loadedPokemon.add(pokemon.name);
        return $.getJSON(pokemon.url);
      });

    Promise.all(newRequests).then(pokeDataArray => {
      pokeDataArray.forEach(pokeData => {
        const name = pokeData.name;
        const image = pokeData.sprites.front_default;
        const types = pokeData.types.map(t => t.type.name).join(', ');

        const card = `
          <div class="user-card" data-types="${types.toLowerCase()}">
            <img loading="lazy" src="${image}" alt="${name}">
            <h4>${name}</h4>
            <p>${types}</p>
          </div>
        `;
        $('#user-list').append(card);
      });
      isLoading = false;
    });
  });
}

$(document).ready(function () {
  const initialLoad = 100;
  loadPokemonBatch(offset, initialLoad);
  offset += initialLoad;

  $(window).on('scroll', function () {
    if (
      $(window).scrollTop() + $(window).height() >= $(document).height() - 100 &&
      !isLoading
    ) {
      loadPokemonBatch(offset, limit);
      offset += limit;
    }
  });

  function highlightByType() {
    const searchType = $('#type-search').val().toLowerCase().trim();
    const highlightColor = typeColors[searchType] || '#ffe6d5';

    $('.user-card').each(function () {
      const types = $(this).data('types');
      if (types.includes(searchType)) {
        $(this).css({
          'border-color': highlightColor,
          'background-color': `${highlightColor}33` // Transparent background
        });
      } else {
        $(this).css({
          'border-color': '#8b8b8b',
          'background-color': '#b9d2f1'
        });
      }
    });
  }

  $('#highlight-btn').click(highlightByType);

  $('#type-search').on('keypress', function (e) {
    if (e.which === 13) {
      highlightByType();
    }
  });
});

// Back to Top button
  const backToTopBtn = $('<button id="back-to-top">↑ Top</button>').css({
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    padding: '10px 15px',
    fontSize: '16px',
    borderRadius: '6px',
    backgroundColor: '#3a3a3a',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'none',
    zIndex: 1000
  });

  $('body').append(backToTopBtn);

  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $('#back-to-top').fadeIn();
    } else {
      $('#back-to-top').fadeOut();
    }
  });

  $('#back-to-top').click(function () {
    $('html, body').animate({ scrollTop: 0 }, '300');
  });
