export function convertNumberTo32bIeee754Float(value: number): Uint8Array {
  // Create a new DataView object with a 4-byte buffer
  let buffer = new ArrayBuffer(4);
  buffer.fill(0); // fill the buffer with 0s
  const dataView = new DataView(buffer);

  // Convert the number to binary using DataView
  dataView.setFloat32(0, value); // set the number at byte offset 0

  // Get the binary representation as an array of bytes
  const bytes = new Uint8Array(buffer);
  return bytes;
}
