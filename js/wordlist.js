// js/wordlist.js
import { normalizeWord } from './normalizeHelper.js'; // Importe a função

let allWordsArray = [];          // Guarda palavras originais (ex: "FÚRIA")
let normalizedValidWordsSet = new Set(); // Guarda palavras normalizadas para validação (ex: "FURIA")
let currentSecretWord = '';      // Guarda a palavra secreta original (ex: "FÚRIA")
let isWordListInitialized = false;

const WORD_LIST_PATH = './assets/palavras_5_letras.txt';

export async function initializeWordList() {
    if (isWordListInitialized) return true;
    try {
        const response = await fetch(WORD_LIST_PATH);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const text = await response.text();
        const wordsFromFile = text.split(/\r?\n/);

        allWordsArray = []; // Limpa antes de popular
        normalizedValidWordsSet.clear(); // Limpa antes de popular

        wordsFromFile.forEach(word => {
            const originalWord = word.trim().toUpperCase();
            if (originalWord.length === 5 && originalWord !== '') { // Garante que a palavra original é válida
                allWordsArray.push(originalWord);
                normalizedValidWordsSet.add(normalizeWord(originalWord));
            }
        });

        if (allWordsArray.length === 0) {
            console.warn("Mestre Construtor: Nenhuma palavra de 5 letras carregada. Verifique o arquivo e seu conteúdo.");
        }
        
        isWordListInitialized = true;
        console.log(`Mestre Construtor: Lista de palavras inicializada. ${allWordsArray.length} palavras carregadas.`);
        return true;
    } catch (error) {
        console.error("Mestre Construtor: Falha crítica ao inicializar lista de palavras.", error);
        isWordListInitialized = false;
        return false;
    }
}

export function getNewSecretWord() {
    if (!isWordListInitialized || allWordsArray.length === 0) {
        console.error("Mestre Construtor: Lista de palavras não pronta para obter palavra secreta.");
        return "ERRO"; 
    }
    currentSecretWord = allWordsArray[Math.floor(Math.random() * allWordsArray.length)];
    console.log(`Mestre Construtor (SPOILER!): A palavra secreta é ${currentSecretWord}`);
    return currentSecretWord;
}

export function getCurrentSecretWord() {
    // ... (lógica existente, currentSecretWord já está com acentos) ...
    // Certifique-se que getNewSecretWord é chamado se currentSecretWord estiver vazio e a lista pronta
    if (!currentSecretWord && isWordListInitialized && allWordsArray.length > 0) {
        return getNewSecretWord();
    }
    return currentSecretWord;
}

export function isValidWord(userInputWord) {
    if (!isWordListInitialized) {
        console.warn("Mestre Construtor: Lista de palavras não pronta para validar.");
        return false; 
    }
    // Normaliza a entrada do usuário para comparar com o Set de palavras normalizadas
    return normalizedValidWordsSet.has(normalizeWord(userInputWord));
}