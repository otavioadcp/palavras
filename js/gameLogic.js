import { normalizeWord } from './normalizeHelper.js'; // Importe a função

// Define os possíveis estados de uma letra na tentativa.
export const LetterState = {
    CORRECT: 'correct',   // Letra correta na posição correta (verde)
    PRESENT: 'present',   // Letra correta na posição errada (amarelo)
    ABSENT: 'absent',     // Letra não existe na palavra (cinza)
    // EMPTY: 'empty'    // Podemos usar para o estado inicial, se necessário
};

/**
 * Compara a palavra tentada (o que está nos tiles) com a palavra secreta.
 * Retorna os estados das letras e as letras que devem ser exibidas (com acentos corretos).
 * @param {string} guessedWordOnTiles A palavra como está nos tiles (pode não ter acentos).
 * @param {string} secretWordOriginal A palavra secreta original (com acentos).
 * @returns {{states: Array<LetterState>, displayLetters: Array<string>}}
 */
export function checkGuess(guessedWordOnTiles, secretWordOriginal) {
    const normalizedGuessed = normalizeWord(guessedWordOnTiles);
    const normalizedSecret = normalizeWord(secretWordOriginal);

    const originalGuessChars = guessedWordOnTiles.toUpperCase().split(''); // Letras como digitadas/exibidas
    const originalSecretChars = secretWordOriginal.toUpperCase().split(''); // Letras da palavra secreta com acento

    const states = new Array(secretWordOriginal.length).fill(LetterState.ABSENT);
    // Começa com as letras que o usuário digitou; serão corrigidas se o estado for CORRECT
    const displayLetters = [...originalGuessChars]; 

    const tempSecretLetterCounts = {}; // Para lidar com letras repetidas na palavra secreta (contagem sobre a forma normalizada)
    normalizedSecret.split('').forEach(letter => {
        tempSecretLetterCounts[letter] = (tempSecretLetterCounts[letter] || 0) + 1;
    });

    // 1ª Passada: Marcar letras CORRETAS (verdes)
    for (let i = 0; i < normalizedGuessed.length; i++) {
        if (normalizedGuessed[i] === normalizedSecret[i]) {
            states[i] = LetterState.CORRECT;
            displayLetters[i] = originalSecretChars[i]; // Mostra a letra correta da palavra secreta (com acento)
            tempSecretLetterCounts[normalizedSecret[i]]--;
        }
    }

    // 2ª Passada: Marcar letras PRESENTES (amarelas)
    for (let i = 0; i < normalizedGuessed.length; i++) {
        if (states[i] === LetterState.CORRECT) {
            continue; // Já marcada como correta
        }
        // A letra normalizada existe na palavra secreta normalizada E ainda há instâncias dela disponíveis
        if (normalizedSecret.includes(normalizedGuessed[i]) && tempSecretLetterCounts[normalizedGuessed[i]] > 0) {
            states[i] = LetterState.PRESENT;
            // Para 'PRESENT', mantemos a letra que o usuário digitou (originalGuessChars[i]) em displayLetters.
            // Se quiséssemos mostrar a versão acentuada da palavra secreta aqui também, seria uma decisão de design.
            // O "Termo" geralmente mostra a letra digitada pelo usuário para 'presente'.
            tempSecretLetterCounts[normalizedGuessed[i]]--;
        }
    }
    return { states, displayLetters };
}