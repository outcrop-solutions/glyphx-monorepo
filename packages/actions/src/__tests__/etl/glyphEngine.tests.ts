import 'mocha';
import {createSandbox} from 'sinon';

describe('#etl/signDataUrls', () => {
  context('signDataUrls', () => {
    const sandbox = createSandbox();
    beforeEach(() => {});
    afterEach(() => {
      sandbox.restore();
    });

    context('auth', () => {
      it('should throw an error if not authorized', async () => {
        try {
        } catch (error) {}
      });
    });

    context('isValidPayload', () => {
      it('should throw an error if invalid payload', async () => {
        try {
        } catch (error) {}
      });
    });

    context('service failures', () => {
      it('should throw an error when process tracking service fails', async () => {
        try {
        } catch (error) {}
      });
      it('should throw an error when project service fails', async () => {
        try {
        } catch (error) {}
      });
      it('should throw an error when s3Connection service fails', async () => {
        try {
        } catch (error) {}
      });
    });
  });
});
