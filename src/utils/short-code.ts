// this function should take in no arguments but should generate a randomshort code when called, this code is what will be the shortbread for the long address.
export default function generateShortBread() {
  const BASE62_ALPHABET =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const shortCodeLength = 6;
  let shortCode = '';
  for (let i = 0; i < shortCodeLength; i++) {
    shortCode +=
      BASE62_ALPHABET[Math.floor(Math.random() * BASE62_ALPHABET.length)];
  }
  return shortCode;
}
