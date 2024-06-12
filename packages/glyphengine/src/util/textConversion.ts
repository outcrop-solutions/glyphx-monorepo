export function convertTextToUtfForBuffer(text: string): Uint8Array {
  let modifiedText;

  // Check if the encoded string length exceeds 65535
  if (text.length > 65535) {
    const parsed = JSON.parse(text);
    if (parsed && Array.isArray(parsed.rowId) && parsed.rowId.length > 0) {
      parsed.rowId = [-9999, parsed.rowId[0]]; // Keep the rowId as an array but with only the first element
      modifiedText = JSON.stringify(parsed);
    }
  } else {
    modifiedText = text;
  }

  // Create a TextEncoder instance
  const encoder = new TextEncoder();
  // Encode the string using UTF-8 encoding
  const encodedString = encoder.encode(modifiedText);
  // Normal encoding
  const byteArray = new Uint8Array(encodedString.length + 2);
  byteArray[0] = (encodedString.length >> 8) & 0xff;
  byteArray[1] = encodedString.length & 0xff;
  byteArray.set(encodedString, 2);

  return byteArray;
}

export function convertUtfForBufferToText(input: Buffer, offset: number): string {
  // buffer is the ArrayBuffer containing the encoded string
  const length = input.readUInt16BE(offset); // length of the encoded string
  const data = input.subarray(offset + 2, offset + 2 + length); // the encoded string
  const encodedString = new Uint8Array(data);
  const decoder = new TextDecoder();
  const decodedString = decoder.decode(encodedString);

  return decodedString;
}
