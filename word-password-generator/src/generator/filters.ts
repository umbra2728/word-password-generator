const awkwardClusterPattern = /[bcdfghjklmnpqrstvwxyz]{4,}/i;
const hardToTypePattern = /(xq|qx|qz|zq|ptk|tkp|kpt|[qxz]{2})/i;

export function hasAwkwardJoin(words: string[], separator: string): boolean {
  return separator === "" && awkwardClusterPattern.test(words.join(separator));
}

function isEasyToTypeWord(word: string): boolean {
  return !hardToTypePattern.test(word);
}

export function passesQualityFilters(
  words: string[],
  separator: string,
  options: { easyToType: boolean; avoidAwkwardClusters: boolean },
): boolean {
  if (options.easyToType && words.some((word) => !isEasyToTypeWord(word))) {
    return false;
  }

  if (options.avoidAwkwardClusters && hasAwkwardJoin(words, separator)) {
    return false;
  }

  return true;
}
