import { createGrid, 
    setTileLetter, 
    clearTileLetter, 
    getWordFromRow, 
    setTileState, 
    NUMBER_OF_ROWS, 
    WORD_LENGTH, 
    getTileElement,
    getRowElement 
} from './grid.js';

import { getNewSecretWord } from './wordlist.js';
import { checkGuess, LetterState } from './gameLogic.js';

// Estado do jogo
let currentRowIndex = 0;
let selectedTileIndex = 0;
let isGameOver = false;
let secretWord = '';
let isInputDisabled = false;

function setupKeyboardListeners() {
    document.addEventListener('keydown', handleKeyPress);
    updateSelectedTileIndicator();
}


function processSubmitAttempt() {
    if (isInputDisabled) return; // Evita submissões múltiplas enquanto anima

    isInputDisabled = true; // Bloqueia novo input durante as animações
    const guessedWord = getWordFromRow(currentRowIndex);
    console.log(`Mestre Construtor: Verificando "${guessedWord}" contra "${secretWord}"`);
    const feedbackStates = checkGuess(guessedWord, secretWord);

    let allCorrect = true;
    let tilesAnimated = 0; // Contador para saber quando todas as animações terminaram

    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = getTileElement(currentRowIndex, i);
        const state = feedbackStates[i];

        if (tile) {
            // Aplica a animação de flip com um atraso escalonado para cada tile
            setTimeout(() => {
                tile.classList.add('tile-is-flipping');

                // A cor do feedback (estado) é aplicada no meio da animação de flip
                // A duração da animação é 0.6s, então o meio é em 0.3s (300ms)
                setTimeout(() => {
                    setTileState(currentRowIndex, i, state);
                }, 300); // Metade da duração da animação de flip

                tile.addEventListener('animationend', () => {
                    tile.classList.remove('tile-is-flipping');
                    tilesAnimated++;
                    // Quando todas as animações da linha terminarem, finaliza a lógica da tentativa
                    if (tilesAnimated === WORD_LENGTH) {
                        finishSubmitAttempt(allCorrect);
                    }
                }, { once: true });
            }, i * 250); // Atraso para iniciar o flip de cada tile (ex: 250ms de diferença)
        } else {
            // Caso um tile não seja encontrado, decrementamos o contador para não bloquear o fluxo
            tilesAnimated++;
             if (tilesAnimated === WORD_LENGTH) {
                finishSubmitAttempt(allCorrect);
            }
        }

        if (state !== LetterState.CORRECT) {
            allCorrect = false;
        }
    }
}

function finishSubmitAttempt(allCorrect) {
    if (allCorrect) {
        setTimeout(() => alert(`🎉 Parabéns! Você acertou: ${secretWord} 🎉`), 100); // Pequeno delay para o último flip
        isGameOver = true;
    } else {
        currentRowIndex++;
        selectedTileIndex = 0; // Reseta a seleção para o início da nova linha

        if (currentRowIndex >= NUMBER_OF_ROWS) {
            console.log(`Mestre Construtor: Fim de jogo! A palavra secreta era "${secretWord}".`);
            setTimeout(() => alert(`😔 Fim de jogo! A palavra era: ${secretWord}`), 100);
            isGameOver = true;
        }
    }

    updateSelectedTileIndicator(); // Atualiza o indicador para a nova linha ou limpa se o jogo acabou
    isInputDisabled = false; // Reabilita o input do teclado
}

function updateSelectedTileIndicator() {
    // Primeiro, remove a classe 'tile-selected' de todas as células na linha atual
    // para garantir que apenas uma esteja selecionada.
    for (let j = 0; j < WORD_LENGTH; j++) {
        const tile = getTileElement(currentRowIndex, j);
        if (tile) {
            tile.classList.remove('tile-selected');
        }
    }

    // Se o jogo não acabou, aplica a classe à célula atualmente selecionada
    if (!isGameOver && currentRowIndex < NUMBER_OF_ROWS) {
        const activeTile = getTileElement(currentRowIndex, selectedTileIndex);
        if (activeTile) {
            activeTile.classList.add('tile-selected');
        }
    }
}

function handleKeyPress(event) {
    if (isGameOver || isInputDisabled) { 
        return;
    }

    const key = event.key;

    if (key === 'ArrowLeft') {
        if (selectedTileIndex > 0) {
            selectedTileIndex--;
            updateSelectedTileIndicator();
        }
    } else if (key === 'ArrowRight') {
        if (selectedTileIndex < WORD_LENGTH - 1) {
            selectedTileIndex++;
            updateSelectedTileIndicator();
        }
    } else if (key.length === 1 && key.match(/[a-zç]/i)) {
        if (currentRowIndex < NUMBER_OF_ROWS) {
            setTileLetter(currentRowIndex, selectedTileIndex, key);
            // Efeito de "pop"
            const tileForPop = getTileElement(currentRowIndex, selectedTileIndex);
            if(tileForPop) {
                tileForPop.classList.add('tile-pop');
                tileForPop.addEventListener('animationend', () => {
                    tileForPop.classList.remove('tile-pop');
                }, { once: true });
            }

            // Avança a seleção para a próxima célula, se não for a última
            if (selectedTileIndex < WORD_LENGTH - 1) {
                selectedTileIndex++;
            }
            updateSelectedTileIndicator();
        }
    } else if (key === 'Backspace') {
        if (isGameOver || currentRowIndex >= NUMBER_OF_ROWS) return; // Não faz nada se o jogo acabou
    
        const tileElement = getTileElement(currentRowIndex, selectedTileIndex);
    
        if (tileElement) {
            // Verifica se a célula atualmente selecionada tem conteúdo
            if (tileElement.textContent !== '') {
                // Primeiro estágio: A célula selecionada tem uma letra, então apenas a limpa.
                // A seleção NÃO se move.
                clearTileLetter(currentRowIndex, selectedTileIndex);
            } else {
                // Segundo estágio: A célula selecionada está vazia.
                // Agora, tentamos mover para a célula anterior e limpá-la.
                if (selectedTileIndex > 0) {
                    selectedTileIndex--; // Move a seleção para a célula anterior
                    clearTileLetter(currentRowIndex, selectedTileIndex); // Limpa a célula agora selecionada (que era a anterior)
                }
                // Se selectedTileIndex já é 0 e está vazia, não faz mais nada.
            }
            updateSelectedTileIndicator(); // Atualiza o indicador visual da seleção
        }
    } else if (key === 'Enter') {
        if (isGameOver) return;
        const currentWord = getWordFromRow(currentRowIndex);
        if (currentWord.length === WORD_LENGTH) { // Verifica se todas as 5 letras estão preenchidas
            processSubmitAttempt();
        } else {
            const currentRowElement = getRowElement(currentRowIndex);
            if (currentRowElement) {
                currentRowElement.classList.add('row-shake-error');
                // Remove a classe após a animação para permitir que seja reativada
                currentRowElement.addEventListener('animationend', () => {
                    currentRowElement.classList.remove('row-shake-error');
                }, { once: true });
            }
        }
    }
}

function handleTileClick(rowIndex, tileColIndex) {
    if (isGameOver || rowIndex !== currentRowIndex) {
        console.log("Seleção de tile bloqueada (game over ou linha errada)."); // DEBUG
        return;
    }
    selectedTileIndex = tileColIndex;
    updateSelectedTileIndicator();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente carregado e analisado.");
    const gameContainer = document.getElementById('game-container');

    if (gameContainer) {
        secretWord = getNewSecretWord(); // Pega a primeira palavra secreta
        createGrid(gameContainer, handleTileClick);
        setupKeyboardListeners();
        updateSelectedTileIndicator(); // Chamada inicial
    } else {
        console.error("Mestre Construtor: Elemento 'game-container' não encontrado no DOM!");
    }
});