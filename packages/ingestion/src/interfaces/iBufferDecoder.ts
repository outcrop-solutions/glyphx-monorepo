export interface IBufferDecoder {
  getChar(buffer: Buffer, offset: number): [string, number] | undefined;
}
