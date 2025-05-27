
// Uma pequena lista inicial de palavras secretas.
// O ideal é que todas tenham WORD_LENGTH (5 letras, no nosso caso).
const secretWords = ["SAGAZ", "IDEIA", "TERMO", "JOGAR", "PODER", "SONHO", "LEVAR", "FLUXO"];
let currentSecretWord = '';

/**
 * Seleciona uma nova palavra secreta da lista.
 * @returns {string} A nova palavra secreta.
 */
export function getNewSecretWord() {
    // Escolhe uma palavra aleatória da lista
    currentSecretWord = secretWords[Math.floor(Math.random() * secretWords.length)].toUpperCase();
    return currentSecretWord;
}

/**
 * Retorna a palavra secreta atualmente em jogo.
 * Se nenhuma foi definida, seleciona uma nova.
 * @returns {string} A palavra secreta atual.
 */
export function getCurrentSecretWord() {
    if (!currentSecretWord) {
        return getNewSecretWord();
    }
    return currentSecretWord;
}