export function convertTextToUtfForBuffer(text: string): Uint8Array {
  let tempString = text;
  //our string is > 2^16 so it will break the way strings are stored in the binary file.
  if (text[0] == '{') {
    //The current application sees the size value as an short not a ushort, so our max length is 2^15 not 2^16.
    if (text.length >= 32768) {
      let jsonObj = JSON.parse(text);
      const tmpId = jsonObj.rowId[0];
      jsonObj.rowId = [-9999, tmpId];
      tempString = JSON.stringify(jsonObj);
    }
  }

  // Create a TextEncoder instance
  const encoder = new TextEncoder();

  // Encode a string using UTF-8 encoding
  const encodedString = encoder.encode(tempString);

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
