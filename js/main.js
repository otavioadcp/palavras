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

import { initializeWordList, getNewSecretWord, isValidWord } from './wordlist.js';
import { checkGuess, LetterState } from './gameLogic.js';
import { createDisplayKeyboard, updateDisplayKeyStates } from './displayKeyboard.js';
import { normalizeWord } from './normalizeHelper.js';

// Estado do jogo
let currentRowIndex = 0;
let selectedTileIndex = 0;
let isGameOver = false;
let secretWord = '';
let isInputDisabled = false;
let allGuessedLetterStates = {};

function setupKeyboardListeners() {
    document.addEventListener('keydown', handleKeyPress);
    updateSelectedTileIndicator();
}


function processSubmitAttempt() {
    if (isInputDisabled) return;
    isInputDisabled = true;

    const guessedWordOnTiles = getWordFromRow(currentRowIndex); // Palavra como foi digitada nos tiles (ex: "FURIA")

    // `secretWord` é a palavra original com acentos
    const feedbackResult = checkGuess(guessedWordOnTiles, secretWord); 

    const isThisGuessWinning = feedbackResult.states.every(s => s === LetterState.CORRECT);
    let tilesAnimated = 0;

    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = getTileElement(currentRowIndex, i);
        const stateForThisTile = feedbackResult.states[i];
        const letterToDisplayOnTile = feedbackResult.displayLetters[i];

        if (tile) {
            setTimeout(() => {
                tile.classList.add('tile-is-flipping');
                setTimeout(() => {
                    setTileLetter(currentRowIndex, i, letterToDisplayOnTile);
                    setTileState(currentRowIndex, i, stateForThisTile);
                }, 300); // Metade da animação de flip

                tile.addEventListener('animationend', () => {
                    tile.classList.remove('tile-is-flipping');
                    tilesAnimated++;
                    if (tilesAnimated === WORD_LENGTH) {
                        // Passa se a tentativa foi vencedora, os estados da linha,
                        // e a palavra como estava nos tiles ANTES da correção visual (para o teclado)
                        finishSubmitAttempt(isThisGuessWinning, feedbackResult.states, guessedWordOnTiles);
                    }
                }, { once: true });
            }, i * 250);
        } else {
            tilesAnimated++;
            if (tilesAnimated === WORD_LENGTH) {
                finishSubmitAttempt(isThisGuessWinning, feedbackResult.states, guessedWordOnTiles);
            }
        }
    }
}

function finishSubmitAttempt(isThisGuessWinning, currentAttemptFeedbackStates, wordSubmittedFromTiles) {
    // `currentAttemptFeedbackStates` é o array com os estados ('correct', 'present', 'absent') da tentativa.
    // `wordSubmittedFromTiles` é a palavra como estava nos tiles (ex: "FURIA").

    // Atualiza o estado global das letras para o teclado de display
    const GUESSED_LETTER_STATUS_PRIORITY = {
        [LetterState.ABSENT]: 1, 
        [LetterState.PRESENT]: 2, 
        [LetterState.CORRECT]: 3,
    };

    // Para o teclado, usamos a forma normalizada da letra que foi efetivamente testada
    const normalizedWordSubmitted = normalizeWord(wordSubmittedFromTiles);

    for (let i = 0; i < WORD_LENGTH; i++) {
        const normalizedLetter = normalizedWordSubmitted[i]; // Letra normalizada da tentativa
        const statusForThisLetter = currentAttemptFeedbackStates[i]; // Estado desta letra na tentativa

        const existingGlobalStatus = allGuessedLetterStates[normalizedLetter];
        
        // Se não existe, prioridade 0
        const priorityOfExistingStatus = GUESSED_LETTER_STATUS_PRIORITY[existingGlobalStatus] || 0; 
        
        const priorityOfCurrentStatus = GUESSED_LETTER_STATUS_PRIORITY[statusForThisLetter] || 0;

        if (priorityOfCurrentStatus > priorityOfExistingStatus) {
            allGuessedLetterStates[normalizedLetter] = statusForThisLetter;
        }
    }
    updateDisplayKeyStates(allGuessedLetterStates); // Comanda a atualização visual do teclado

    // Lógica de vitória, derrota e avanço de linha
    if (isThisGuessWinning) {
        console.log("Mestre Construtor: PARABÉNS! Você desvendou a palavra secreta!");
        setTimeout(() => alert(`🎉 Parabéns! Você acertou: ${secretWord} 🎉`), 100);
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

    updateSelectedTileIndicator(); // Atualiza o indicador de tile selecionado para a nova linha ou limpa
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
    } else if (key === 'Enter') { // Ou if (key.toUpperCase() === 'ENTER') para o teclado virtual
        if (isGameOver || isInputDisabled) return;

        const guessedWord = getWordFromRow(currentRowIndex); // Pega a palavra da linha
        
        if (guessedWord.length === WORD_LENGTH) {
            // NOVA VERIFICAÇÃO: Checa se a palavra é válida ANTES de processar
            if (isValidWord(guessedWord)) {
                processSubmitAttempt(); // Procede com a submissão (flips, etc.)
            } else {
                // Palavra inválida! Informa o usuário e não submete.
                console.log(`Mestre Construtor: Palavra "${guessedWord}" não reconhecida no dicionário!`);
                // Acionar o efeito de "tremer" na linha (shakeRow)
                const currentRowElement = getRowElement(currentRowIndex);
                if (currentRowElement) {
                    currentRowElement.classList.add('row-shake-error');
                    currentRowElement.addEventListener('animationend', () => {
                        currentRowElement.classList.remove('row-shake-error');
                    }, { once: true });
                }
                // Poderia também exibir uma mensagem mais proeminente na UI.
            }
        } else {
            console.log("Mestre Construtor: Complete todas as letras antes de submeter!");
            const currentRowElement = getRowElement(currentRowIndex);
            if (currentRowElement) {
                currentRowElement.classList.add('row-shake-error');
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

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM completamente carregado e analisado.");
    const gameContainer = document.getElementById('game-container');

    //Carrega a lista de palavras antes de qlq outra coisa
    const wordListLoadedSuccessfully = await initializeWordList();

    if (!wordListLoadedSuccessfully) {
        // Se a lista de palavras não pôde ser carregada, exibe uma mensagem e impede o jogo
        if (gameContainer) {
            gameContainer.innerHTML = '<p style="color: red; text-align: center;">Erro crítico: Não foi possível carregar a lista de palavras. O jogo não pode iniciar.</p>';
        }
        return; // Interrompe a inicialização do jogo
    }

    createDisplayKeyboard('display-keyboard-container'); // Usa o ID do container do index.html

    if (gameContainer) {
        secretWord = getNewSecretWord(); // Pega a primeira palavra secreta
        if (secretWord === "ERRO" || !secretWord) { // Checa se a palavra secreta foi obtida
             if (gameContainer) {
                gameContainer.innerHTML = '<p style="color: red; text-align: center;">Erro crítico: Não foi possível definir uma palavra secreta. O jogo não pode iniciar.</p>';
            }
            return;
        }

        createGrid(gameContainer, handleTileClick);
        setupKeyboardListeners();
        updateSelectedTileIndicator();
        createDisplayKeyboard('display-keyboard-container');
        updateDisplayKeyStates(allGuessedLetterStates); // Atualiza o teclado (estará vazio inicialmente)
    } else {
        console.error("Mestre Construtor: Elemento 'game-container' não encontrado no DOM!");
    }
});