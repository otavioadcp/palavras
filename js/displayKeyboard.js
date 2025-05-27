import { LetterState } from './gameLogic.js';
import { normalizeWord } from './normalizeHelper.js'; // Importe a função

// Layout do teclado (Padrão QWERTY adaptado incluindo Ç)
const KEY_LAYOUT = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
    // ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"] // Para quando for funcional
    ["Z", "X", "C", "V", "B", "N", "M"]
];

// Objeto para armazenar as referências aos elementos DOM das teclas de display
let displayKeyElements = {};

/**
 * Cria a estrutura HTML do teclado de display e a insere no container.
 * @param {string} containerId O ID do elemento container do teclado.
 */
export function createDisplayKeyboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Mestre Construtor: Container do teclado de display não encontrado!");
        return;
    }

    container.innerHTML = ''; // Limpa container para o caso de recriação
    displayKeyElements = {}; // Limpa referências antigas

    KEY_LAYOUT.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        row.forEach(keyVal => {
            const keyDiv = document.createElement('div');
            keyDiv.classList.add('key-display');
            keyDiv.textContent = keyVal;
            keyDiv.dataset.key = keyVal.toUpperCase(); 

            // Adiciona classe para teclas "especiais" se decidir mostrá-las (ex: Enter, Backspace)
            // if (keyVal.length > 1) keyDiv.classList.add('special');

            rowDiv.appendChild(keyDiv);
            displayKeyElements[keyVal.toUpperCase()] = keyDiv; // Salva referência
        });

        container.appendChild(rowDiv);
    
    });
    
    console.log("Mestre Construtor: Teclado de display criado.");
}

/**
 * Atualiza o estado visual das teclas no teclado de display.
 * @param {Object} letterStates Objeto com o estado de cada letra (ex: {'A': 'correct', 'B': 'absent'})
 */
export function updateDisplayKeyStates(letterStates) { // letterStates usa chaves normalizadas (ex: 'C' para 'Ç')
    for (const originalKeyText in displayKeyElements) { // originalKeyText é 'Q', 'W', ..., 'Ç' do layout
        const keyElement = displayKeyElements[originalKeyText];
        const normalizedKeyText = normalizeWord(originalKeyText); // Converte 'Ç' para 'C', 'A' para 'A', etc.
        const state = letterStates[normalizedKeyText];

        keyElement.classList.remove('key-correct', 'key-present', 'key-absent');

        if (state) {
            switch (state) {
                case LetterState.CORRECT:
                    keyElement.classList.add('key-correct');
                    break;
                case LetterState.PRESENT:
                    keyElement.classList.add('key-present');
                    break;
                case LetterState.ABSENT:
                    keyElement.classList.add('key-absent');
                    break;
            }
        }
    }
}