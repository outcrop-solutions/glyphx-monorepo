export function convertTextToUtfForBuffer(text: string): Uint8Array {
  let tempString = text;
  //our string is > 2^16 so it will break the way strings are stored in the binary file.
  if (text[0] == '{') {
    // if (text.length >= 65535) {
    let jsonObj = JSON.parse(text);
    const tmpId = jsonObj.rowId[0];

    if (text.length >= 65535) {
      console.log({tmpId});
    }

    jsonObj.rowId = [-9999, tmpId];
    tempString = JSON.stringify(jsonObj);
    console.log({tempString: tempString, length: tempString.length});
    // }
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
