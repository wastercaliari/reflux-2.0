export function hash<T = never>(content: T): string {
  try {
    const base64 = btoa(String(content));
    const hex = stringToHex(base64);
    const inverse = hex.split('').reverse().join('');

    return inverse;
  } catch {
    return String(content);
  }
}

export function unhash(content: string): string {
  try {
    const inverse = content.split('').reverse().join('');
    const hex = hexToString(inverse);
    const base64 = atob(hex);

    return base64;
  } catch {
    return content;
  }
}

function stringToHex(input: string) {
  let output = '';

  for (let i = 0; i < input.length; i++) {
    output += input.charCodeAt(i).toString(16).padStart(2, '0').toLowerCase();
  }

  return output;
}

function hexToString(input: string) {
  const hex = input.match(/[0-9a-fA-F]{2}/g);
  let output = '';

  if (hex) {
    hex.forEach(
      (h) =>
        (output += String.fromCharCode(
          Number.parseInt(h.replace('\\x', ''), 16),
        )),
    );
  }

  return output;
}
