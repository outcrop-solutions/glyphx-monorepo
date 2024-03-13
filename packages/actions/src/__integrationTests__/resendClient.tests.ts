import 'mocha';
import {assert} from 'chai';
import emailClient from '../email';
import {del, put} from '@vercel/blob';
import {emailTypes} from 'types';
import {EmailError} from 'core/src/error';
import {imageHash} from './constants/imageHash';

describe('#integrationTests/ResendClient', () => {
  before(async () => {
    await emailClient.init();
    assert.isTrue(emailClient.isInited);
  });
  context('#sendEmail', () => {
    it('Will send the emailUpdated email', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.EMAIL_UPDATED,
          newEmail: 'james@glyphx.co',
          oldEmail: 'james@glyphx.co',
        } satisfies emailTypes.EmailData;
        const retval = await emailClient.sendEmail(emailData);
        assert.isOk(retval?.id);
      } catch (error) {
        assert.fail();
      }
    });
    it('Will throw an EmailError when provided invalid inputs', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.EMAIL_UPDATED,
          newEmail: undefined as unknown as string,
          oldEmail: undefined as unknown as string,
        } satisfies emailTypes.EmailData;
        await emailClient.sendEmail(emailData);
      } catch (error) {
        assert.instanceOf(error, EmailError);
      }
    });
    it('Will send the emailVerification email', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.EMAIL_VERFICATION,
          identifier: 'james@glyphx.co',
          provider: {
            from: '',
          },
          url: '',
          theme: 'dark',
        } satisfies emailTypes.EmailData;
        const retval = await emailClient.sendEmail(emailData);
        assert.isOk(retval?.id);
      } catch (error) {
        assert.fail();
      }
    });
    it('Will throw an EmailError when provided invalid inputs', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.EMAIL_VERFICATION,
          identifier: undefined as unknown as string,
          provider: {
            from: undefined as unknown as string,
          },
          url: undefined as unknown as string,
          theme: 'dark',
        } satisfies emailTypes.EmailData;
        await emailClient.sendEmail(emailData);
      } catch (error) {
        assert.instanceOf(error, EmailError);
      }
    });
    it('Will send the stateCreated email', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.STATE_CREATED,
          stateName: '',
          stateImage: '',
          emails: ['james@glyphx.co', 'jp@glyphx.co'],
        } satisfies emailTypes.EmailData;
        const retval = await emailClient.sendEmail(emailData);
        assert.isOk(retval?.id);
      } catch (error) {
        assert.fail();
      }
    });
    it('Will throw an EmailError when provided invalid inputs', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.STATE_CREATED,
          stateName: undefined as unknown as string,
          stateImage: undefined as unknown as string,
          emails: [],
        } satisfies emailTypes.EmailData;
        await emailClient.sendEmail(emailData);
      } catch (error) {
        assert.instanceOf(error, EmailError);
      }
    });
    it('Will send the annotationCreated email', async () => {
      try {
        const imagePath = `resendClientIntegrationTest`;
        const buffer = Buffer.from(imageHash, 'base64');
        const blob = new Blob([buffer], {type: 'image/png'});

        // upload imageHash to
        // ⚠️ The below code is for App Router Route Handlers only
        const imageRetval = await put(imagePath, blob, {
          access: 'public',
          addRandomSuffix: false,
        });
        const emailData = {
          type: emailTypes.EmailTypes.ANNOTATION_CREATED,
          stateName: '',
          stateImage: imageRetval.url,
          annotation: '',
          emails: ['james@glyphx.co'],
        } satisfies emailTypes.EmailData;
        const retval = await emailClient.sendEmail(emailData);
        assert.isOk(retval?.id);

        await del(imagePath);
      } catch (error) {
        assert.fail();
      }
    });
    it('Will throw an EmailError when provided invalid inputs', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.ANNOTATION_CREATED,
          stateName: undefined as unknown as string,
          stateImage: undefined as unknown as string,
          annotation: undefined as unknown as string,
          emails: [],
        } satisfies emailTypes.EmailData;
        await emailClient.sendEmail(emailData);
      } catch (error) {
        assert.instanceOf(error, EmailError);
      }
    });
    it('Will send the workspaceCreated email', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.WORKSPACE_CREATED,
          workspaceName: 'workspace',
          workspaceId: 'id',
          email: 'james@glyphx.co',
          workspaceCode: 'code',
        } satisfies emailTypes.EmailData;
        const retval = await emailClient.sendEmail(emailData);
        assert.isOk(retval?.id);
      } catch (error) {
        assert.fail();
      }
    });
    it('Will throw an EmailError when provided invalid inputs', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.WORKSPACE_CREATED,
          workspaceName: undefined as unknown as string,
          workspaceId: 'id',
          email: undefined as unknown as string,
          workspaceCode: undefined as unknown as string,
        } satisfies emailTypes.EmailData;
        await emailClient.sendEmail(emailData);
      } catch (error) {
        assert.instanceOf(error, EmailError);
      }
    });
    it('Will send the workspaceInvitation email', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.WORKSPACE_INVITATION,
          workspaceName: 'workspace',
          emails: ['james@glyphx.co'],
          workspaceId: 'id',
          inviteCode: 'code',
        } satisfies emailTypes.EmailData;
        const retval = await emailClient.sendEmail(emailData);
        assert.isOk(retval?.id);
      } catch (error) {
        assert.fail();
      }
    });
    it('Will throw an EmailError when provided invalid inputs', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.WORKSPACE_INVITATION,
          workspaceName: undefined as unknown as string,
          emails: undefined as unknown as string[],
          inviteCode: undefined as unknown as string,
          workspaceId: 'id',
        } satisfies emailTypes.EmailData;
        await emailClient.sendEmail(emailData);
      } catch (error) {
        assert.instanceOf(error, EmailError);
      }
    });
    it('Will send the workspaceJoined email', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.WORKSPACE_JOINED,
          userName: 'user',
          workspaceName: 'workspace',
          workspaceCode: 'workspace',
          workspaceId: 'id',
          email: 'james@glyphx.co',
        } satisfies emailTypes.EmailData;
        const retval = await emailClient.sendEmail(emailData);
        assert.isOk(retval?.id);
      } catch (error) {
        assert.fail();
      }
    });
    it('Will throw an EmailError when provided invalid inputs', async () => {
      try {
        const emailData = {
          type: emailTypes.EmailTypes.WORKSPACE_JOINED,
          userName: undefined as unknown as string,
          workspaceName: undefined as unknown as string,
          workspaceCode: undefined as unknown as string,
          workspaceId: undefined as unknown as string,
          email: undefined as unknown as string,
        } satisfies emailTypes.EmailData;
        await emailClient.sendEmail(emailData);
      } catch (error) {
        assert.instanceOf(error, EmailError);
      }
    });
  });
});
