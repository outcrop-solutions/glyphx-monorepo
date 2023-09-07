import {CodeGenerator} from './generator/codeGenerator';

(async () => {
  const codeGen = new CodeGenerator(undefined);
  await codeGen.generate();
})();
