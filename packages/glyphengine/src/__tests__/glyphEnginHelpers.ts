import fs from 'fs';

export async function getMockTemplate(): Promise<string> {
  const template = await fs.promises.readFile('./src/__tests__/mockSdtTemplate.xml', 'utf8');

  return template;
}
