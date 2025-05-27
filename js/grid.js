// js/grid.js

// Constantes que definem a estrutura do nosso grid.
export const NUMBER_OF_ROWS = 6; // Exportando para uso em main.js
export const WORD_LENGTH = 5;    // Exportando para uso em main.js

let gridTiles = []; // Array 2D para armazenar as referências dos elementos das células (tiles)
let rowElements = []; // Novo array para armazenar os elementos das linhas

/**
 * Cria o grid de tentativas, armazena referências às células e o anexa ao container.
 * @param {HTMLElement} containerElement O elemento DOM onde o grid será inserido.
 */
export function createGrid(containerElement, onTileClickHandler) {
    containerElement.innerHTML = '';
    gridTiles = [];
    rowElements = []; // Limpa para o caso de recriação

    const gameBoard = document.createElement('div');
    gameBoard.id = 'game-board';

    for (let i = 0; i < NUMBER_OF_ROWS; i++) {
        const rowElement = document.createElement('div');
        rowElement.classList.add('attempt-row');
        rowElement.id = `attempt-row-${i}`; // Adiciona um ID para fácil referência
        const currentRowTiles = [];

        for (let j = 0; j < WORD_LENGTH; j++) {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile');
            tileElement.dataset.row = i;
            tileElement.dataset.col = j;

            // Adiciona o event listener para o clique
            tileElement.addEventListener('click', () => {
                if (onTileClickHandler) {
                    onTileClickHandler(i, j);
                }
            });

            rowElement.appendChild(tileElement);
            currentRowTiles.push(tileElement);
        }
        gameBoard.appendChild(rowElement);
        gridTiles.push(currentRowTiles);
        rowElements.push(rowElement);

    }
    containerElement.appendChild(gameBoard);
    console.log("Mestre Construtor: Grid criado com células clicáveis!");
}

/**
 * Retorna o elemento DOM de uma linha específica.
 * @param {number} rowIndex Índice da linha.
 * @returns {HTMLElement|null} O elemento da linha ou null se não encontrado.
 */
export function getRowElement(rowIndex) {
    return rowElements[rowIndex] || null;
}

/**
 * Define uma letra em uma célula específica do grid.
 * @param {number} rowIndex Índice da linha.
 * @param {number} tileIndex Índice da célula na linha.
 * @param {string} letter A letra a ser inserida.
 */
export function setTileLetter(rowIndex, tileIndex, letter) {
    if (gridTiles[rowIndex] && gridTiles[rowIndex][tileIndex]) {
        const tile = gridTiles[rowIndex][tileIndex];
        tile.textContent = letter.toUpperCase();
        tile.classList.add('filled');

        // Adicionar e remover classe para animação de 'pop'
        tile.classList.add('tile-pop');
        // Remover a classe após a animação para permitir que ela seja reativada
        tile.addEventListener('animationend', () => {
            tile.classList.remove('tile-pop');
        }, { once: true }); // Garante que o listener seja removido após a primeira execução

    } else {
        console.warn(`Mestre Construtor: Célula [${rowIndex},${tileIndex}] não encontrada para setar letra.`);
    }
}
// ...

/**
 * Limpa a letra de uma célula específica do grid.
 * @param {number} rowIndex Índice da linha.
 * @param {number} tileIndex Índice da célula na linha.
 */
export function clearTileLetter(rowIndex, tileIndex) {
    if (gridTiles[rowIndex] && gridTiles[rowIndex][tileIndex]) {
        const tile = gridTiles[rowIndex][tileIndex];
        tile.textContent = '';
        tile.classList.remove('filled'); // Remove a classe de feedback visual
    } else {
        console.warn(`Mestre Construtor: Célula [${rowIndex},${tileIndex}] não encontrada.`);
    }
}

/**
 * (Opcional por agora, mas útil em breve) Retorna a palavra da linha atual.
 * @param {number} rowIndex Índice da linha.
 * @returns {string} A palavra formada pelas letras na linha.
 */
export function getWordFromRow(rowIndex) {
    if (!gridTiles[rowIndex]) return '';
    return gridTiles[rowIndex].map(tile => tile.textContent).join('');
}

/**
 * Define o estado visual de uma célula (correta, presente, ausente).
 * @param {number} rowIndex Índice da linha.
 * @param {number} tileIndex Índice da célula na linha.
 * @param {string} state O estado a ser aplicado ('correct', 'present', 'absent').
 */
export function setTileState(rowIndex, tileIndex, state) {
    if (gridTiles[rowIndex] && gridTiles[rowIndex][tileIndex]) {
        const tile = gridTiles[rowIndex][tileIndex];
        // Limpa quaisquer estados de feedback anteriores e a classe 'filled' se o estado for específico
        tile.classList.remove('correct', 'present', 'absent', 'filled');

        // Adiciona a nova classe de estado, se houver
        if (state) { // 'correct', 'present', 'absent'
            tile.classList.add(state);
        }
    } else {
        console.warn(`Mestre Construtor: Tentativa de definir estado para célula [${rowIndex},${tileIndex}] não encontrada.`);
    }
}

/**
 * Retorna o elemento DOM de uma célula específica.
 * @param {number} rowIndex Índice da linha.
 * @param {number} tileIndex Índice da célula.
 * @returns {HTMLElement|null} O elemento da célula ou null se não encontrado.
 */
export function getTileElement(rowIndex, tileIndex) {
    if (gridTiles[rowIndex] && gridTiles[rowIndex][tileIndex]) {
        return gridTiles[rowIndex][tileIndex];
    }
    return null;
}