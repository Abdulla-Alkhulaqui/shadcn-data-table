const DEFAULT_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

interface GenerateIdOptions {
  alphabet?: string;
  length?: number;
}

export function generateId(options: GenerateIdOptions = {}): string {
  const { alphabet = DEFAULT_ALPHABET, length = 12 } = options;

  const chars = new Array(length);

  for (let i = 0; i < length; i++) {
    chars[i] = alphabet[(Math.random() * alphabet.length) | 0];
  }

  return chars.join("");
}
