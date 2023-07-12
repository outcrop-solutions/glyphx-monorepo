import { CodeGenerator } from 'generator/codeGenerator';

(async () => {
  const codeGen = new CodeGenerator('../../types/src/database');
  await codeGen.generate();
})();
