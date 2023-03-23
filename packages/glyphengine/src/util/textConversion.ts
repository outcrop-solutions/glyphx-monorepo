export function convertTextToUtfForBuffer(text: string): Uint8Array {
  // Create a TextEncoder instance
  const encoder = new TextEncoder();

  // Encode a string using UTF-8 encoding
  const encodedString = encoder.encode(text);

  // Write the encoded string to a byte array
  const byteArray = new Uint8Array(encodedString.length + 2);
  byteArray[0] = (encodedString.length >> 8) & 0xff;
  byteArray[1] = encodedString.length & 0xff;
  byteArray.set(encodedString, 2);

  return byteArray;
}

export function convertUtfForBufferToText(
  input: Buffer,
  offset: number
): string {
  // buffer is the ArrayBuffer containing the encoded string
  const length = input.readUInt16BE(offset); // length of the encoded string
  const encodedString = new Uint8Array(input, offset + 2, length);
  const decoder = new TextDecoder();
  const decodedString = decoder.decode(encodedString);

  //The encoder adds the utf marks, we will just remove them here.
  const cleanString = decodedString.slice(2);
  return cleanString;
}
