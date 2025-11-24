/**
 * Cria o elemento HTML para um card de Pokémon.
 * @param {object} pokemon - O objeto do Pokémon com seus dados.
 * @param {string} urlImagem - A URL da imagem do Pokémon.
 * @returns {HTMLElement} O elemento <article> do card.
 */
function criarCardPokemon(pokemon, urlImagem) {
    const card = document.createElement('article');
    card.classList.add('card');

    // Adiciona o evento de clique para refinar a busca
    card.onclick = () => {
        const buscaInput = document.getElementById('busca-pokemon');
        buscaInput.value = pokemon.nome; // Preenche o input com o nome exato
        iniciarBusca(); // Inicia a busca novamente com o nome exato
    };

    // Se a URL da imagem não for encontrada, o onerror vai esconder a tag da imagem.
    const imagemHTML = `
        <img src="${urlImagem}" alt="Imagem do ${pokemon.nome}" class="pokemon-imagem" onerror="this.style.display='none'">
    `;

    const infoHTML = `
        <div class="pokemon-info">
            <h2>${pokemon.nome}</h2>
            <h3>${pokemon.tipo}</h3>
            <p>${pokemon.tipo_descricao}</p>
            <h3>${pokemon.habilidades}</h3>
            <p>${pokemon.habilidades_descricao}</p>
            <h3>${pokemon.descricao}</h3>
            <p>${pokemon.descricao_descricao}</p>
        </div>
    `;

    card.innerHTML = imagemHTML + infoHTML;
    return card;
}

/**
 * Normaliza o nome do Pokémon para ser compatível com a PokéAPI.
 * @param {string} nome - O nome do Pokémon.
 * @returns {string} O nome normalizado.
 */
function normalizarNome(nome) {
    return nome.toLowerCase()
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/\./g, '')
        .replace(/'/g, '')
        .replace(/\s/g, '-');
}

let todosOsPokemons = []; // Armazena a lista de todos os pokémons

/**
 * Carrega os dados dos Pokémon do arquivo JSON e armazena em uma variável.
 */
async function carregarPokemons() {
    try {
        const response = await fetch('data.json');
        todosOsPokemons = await response.json();
    } catch (error) {
        console.error("Falha ao carregar o arquivo data.json:", error);
    }
}

/**
 * Mostra sugestões de busca com base no texto digitado.
 * @param {string} termo - O texto digitado pelo usuário.
 */
function mostrarSugestoes(termo) {
    const containerSugestoes = document.getElementById('sugestoes-container');
    containerSugestoes.innerHTML = ''; // Limpa sugestões anteriores

    if (termo.length < 3) {
        containerSugestoes.style.display = 'none';
        return;
    }

    const sugestoesFiltradas = todosOsPokemons.filter(pokemon =>
        pokemon.nome.toLowerCase().startsWith(termo)
    );

    if (sugestoesFiltradas.length > 0) {
        sugestoesFiltradas.forEach(pokemon => {
            const itemSugestao = document.createElement('div');
            itemSugestao.classList.add('sugestao-item');
            itemSugestao.textContent = pokemon.nome;
            itemSugestao.onclick = () => {
                document.getElementById('busca-pokemon').value = pokemon.nome;
                containerSugestoes.style.display = 'none';
                iniciarBusca();
            };
            containerSugestoes.appendChild(itemSugestao);
        });
        containerSugestoes.style.display = 'block';
    } else {
        containerSugestoes.style.display = 'none';
    }
}

/**
 * Cria e anexa o container para as sugestões de busca.
 */
function criarContainerDeSugestoes() {
    const container = document.createElement('div');
    container.id = 'sugestoes-container';
    // Anexa o container de sugestões ao corpo do documento ou a um elemento específico.
    document.querySelector('div input[type="text"]').parentElement.appendChild(container);
}

/**
 * Inicia a busca pelos Pokémon, filtra e exibe os resultados.
 */
async function iniciarBusca() {
    const descriptionSection = document.querySelector('.page-description');
    if (descriptionSection) {
        descriptionSection.style.display = 'none';
    }

    const termoBusca = document.getElementById('busca-pokemon').value.toLowerCase();
    const container = document.querySelector('.card-container');
    container.innerHTML = '<p>Buscando Pokémon...</p>'; // Mensagem de carregamento

    if (todosOsPokemons.length > 0) {
        const resultadosFiltrados = todosOsPokemons.filter(pokemon =>
            pokemon.nome.toLowerCase().includes(termoBusca)
        );

        container.innerHTML = ''; // Limpa o container antes de adicionar os resultados

        if (resultadosFiltrados.length === 0) {
            container.innerHTML = '<p>Nenhum Pokémon encontrado com esse nome. Tente novamente!</p>';
        } else {
            for (const pokemon of resultadosFiltrados) {
                try {
                    const nomeApi = normalizarNome(pokemon.nome);
                    const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomeApi}`);
                    const apiData = await apiResponse.json();
                    const urlImagem = apiData.sprites.other['official-artwork'].front_default;
                    container.appendChild(criarCardPokemon(pokemon, urlImagem));
                } catch (e) {
                    // Se falhar (ex: Pokémon customizado não encontrado na API), cria o card sem imagem.
                    container.appendChild(criarCardPokemon(pokemon, ''));
                    console.warn(`Não foi possível encontrar a imagem para "${pokemon.nome}" na PokéAPI.`);
                }
            }
        }
    } else {
        container.innerHTML = '<p>Erro ao carregar os dados dos Pokémon. Tente novamente mais tarde.</p>';
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    carregarPokemons();
    criarContainerDeSugestoes();

    const buscaInput = document.getElementById('busca-pokemon');
    buscaInput.addEventListener('input', () => {
        mostrarSugestoes(buscaInput.value.toLowerCase());
    });

    // Esconde as sugestões se o usuário clicar fora
    document.addEventListener('click', (event) => {
        const containerSugestoes = document.getElementById('sugestoes-container');
        if (!containerSugestoes.contains(event.target) && event.target !== buscaInput) {
            containerSugestoes.style.display = 'none';
        }
    });
});
// Adiciona um event listener para a tecla "Enter" no campo de busca.
document.getElementById('busca-pokemon').addEventListener('keydown', function(event) {
    // Verifica se a tecla pressionada foi "Enter".
    if (event.key === 'Enter') {
        // Impede o comportamento padrão do Enter (como submeter um formulário).
        event.preventDefault();
        // Chama a função de busca.
        iniciarBusca();
    }
});