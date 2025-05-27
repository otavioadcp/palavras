// js/gameLogic.js

// Define os possíveis estados de uma letra na tentativa.
export const LetterState = {
    CORRECT: 'correct',   // Letra correta na posição correta (verde)
    PRESENT: 'present',   // Letra correta na posição errada (amarelo)
    ABSENT: 'absent',     // Letra não existe na palavra (cinza)
    // EMPTY: 'empty'    // Podemos usar para o estado inicial, se necessário
};

/**
 * Compara a palavra tentada com a palavra secreta.
 * Retorna um array de estados para cada letra da tentativa.
 * @param {string} guessedWord A palavra tentada pelo jogador.
 * @param {string} secretWord A palavra secreta.
 * @returns {Array<LetterState>} Um array com os estados de cada letra.
 */
export function checkGuess(guessedWord, secretWord) {
    const guess = guessedWord.toUpperCase().split('');
    const secret = secretWord.toUpperCase().split('');
    const result = new Array(secret.length).fill(null); // Inicializa com null para marcar processamento

    const secretLetterCounts = {};
    for (const letter of secret) {
        secretLetterCounts[letter] = (secretLetterCounts[letter] || 0) + 1;
    }

    // 1ª Passada: Marcar letras CORRETAS (verdes)
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === secret[i]) {
            result[i] = LetterState.CORRECT;
            secretLetterCounts[guess[i]]--;
        }
    }

    // 2ª Passada: Marcar letras PRESENTES (amarelas) e AUSENTES (cinzas)
    for (let i = 0; i < guess.length; i++) {
        if (result[i] === LetterState.CORRECT) {
            continue; // Já processada como correta
        }
        if (secret.includes(guess[i]) && secretLetterCounts[guess[i]] > 0) {
            result[i] = LetterState.PRESENT;
            secretLetterCounts[guess[i]]--;
        } else {
            result[i] = LetterState.ABSENT;
        }
    }
    return result;
}