import * as levenshtein from 'damerau-levenshtein';

const minimumSimilarityPercentage = 40;
const similarityThreshold = 0.6;
const similaritySteps = 8;

export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ +(?= )/g, '')
    .trim()
    .toLowerCase();
}

// Not used: in my personal tests, it doesn't work properly yet because the content title is so dirty.
export function isPhraseSimilar(
  thisPhrase: string,
  thatPhrase: string,
): boolean {
  const thisWords = normalizeText(thisPhrase).split(/\s+/);
  const thatWords = normalizeText(thatPhrase).split(/\s+/);

  const exactWords = new Set<string>();
  const similarWords = new Set<string>();

  for (const word1 of thisWords) {
    for (const word2 of thatWords) {
      if (word1 === word2) {
        exactWords.add(word1);
        break;
      } else if (isWordSimilar(word1, word2)) {
        similarWords.add(word1);
        break;
      }
    }
  }

  const totalWords = Math.max(thisWords.length, thatWords.length);
  const similarWordCount = exactWords.size + similarWords.size;

  const similarityPercentage = (similarWordCount / totalWords) * 100;
  return similarityPercentage >= minimumSimilarityPercentage;
}

// Not used: in my personal tests, it doesn't work properly yet because the content title is so dirty.
export function isWordSimilar(thisWord: string, thatWord: string): boolean {
  const distance = levenshtein(thisWord, thatWord);

  return (
    distance.steps <= similaritySteps &&
    distance.similarity >= similarityThreshold
  );
}
