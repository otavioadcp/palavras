/**
 * Normaliza uma string: converte para maiúsculas, remove acentos e substitui Ç por C.
 * @param {string} str A string a ser normalizada.
 * @returns {string} A string normalizada.
 */
export function normalizeWord(str) {
    if (typeof str !== 'string') return '';
    return str.toUpperCase()
              .normalize("NFD") // Decompõe caracteres acentuados (ex: "Ú" -> "U" + "´")
              .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (acentos)
              .replace(/Ç/g, "C"); // Substitui Ç por C
}