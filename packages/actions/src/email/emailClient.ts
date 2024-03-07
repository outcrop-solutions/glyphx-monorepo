import {EmailError} from 'core/src/error';
import {bindSecrets, boundProperty} from 'core';
import {Resend} from 'resend';
import {
  AnnotationCreatedTemplate,
  EmailUpdatedTemplate,
  EmailVerificationTemplate,
  StateCreatedTemplate,
  WorkspaceCreatedTemplate,
  WorkspaceInvitationTemplate,
  WorkspaceJoinedTemplate,
} from './templates';
import {emailTypes} from 'types';

/**
 * Converts react components into email compatible html
 */
@bindSecrets('email/resend')
export class ResendClient {
  @boundProperty()
  apiKey: string;

  private fromField: string = 'jp@glyphx.co';
  private isInitedField: boolean;

  public get isInited(): boolean {
    return this.isInitedField;
  }

  constructor() {
    this.apiKey = '';
    this.isInitedField = false;
  }

  async init(): Promise<void> {
    if (!this.isInitedField) {
      try {
        this.client = new Resend(this.apiKey);
        this.isInitedField = true;
      } catch (error) {
        throw new EmailError('Unable to construct the Resend client', {});
      }
    }
  }

  private client: Resend | undefined;

  // Function to resend email
  public async sendEmail(emailData: emailTypes.EmailData): Promise<{id: string} | null> {
    switch (emailData.type) {
      case emailTypes.EmailTypes.EMAIL_UPDATED:
        return await this.sendEmailUpdated(emailData);
      case emailTypes.EmailTypes.EMAIL_VERFICATION:
        return await this.sendEmailVerification(emailData);
      case emailTypes.EmailTypes.STATE_CREATED:
        return await this.sendStateCreated(emailData);
      case emailTypes.EmailTypes.WORKSPACE_CREATED:
        return await this.sendWorkspaceCreated(emailData);
      case emailTypes.EmailTypes.ANNOTATION_CREATED:
        return await this.sendAnnotationCreated(emailData);
      case emailTypes.EmailTypes.WORKSPACE_INVITATION:
        return await this.sendWorkspaceInvitation(emailData);
      case emailTypes.EmailTypes.WORKSPACE_JOINED:
        return await this.sendWorkspaceJoined(emailData);
      default:
        throw new EmailError('Invalid email data type provided', {});
    }
  }

  private async sendEmailUpdated(emailData: emailTypes.iEmailUpdatedData) {
    try {
      const {data, error} = await this.client!.emails.send({
        from: this.fromField,
        to: emailData.oldEmail,
        subject: 'Glyphx: Email Updated',
        react: EmailUpdatedTemplate(emailData),
      });
      if (error) {
        throw error;
      } else {
        return data;
      }
    } catch (error) {
      throw new EmailError('An error occured sending the email updated email', error);
    }
  }

  private async sendEmailVerification(emailData: emailTypes.iEmailVerificationData) {
    try {
      const {data, error} = await this.client!.emails.send({
        from: this.fromField,
        to: [emailData.identifier],
        subject: 'Glyphx: Verify Email',
        react: EmailVerificationTemplate(emailData),
      });
      if (error) {
        throw error;
      } else {
        return data;
      }
    } catch (error) {
      throw new EmailError('An error occured sending the email verification email', error);
    }
  }

  private async sendStateCreated(emailData: emailTypes.iStateCreatedData) {
    try {
      const {data, error} = await this.client!.emails.send({
        from: this.fromField,
        to: emailData.emails,
        subject: 'Glyphx: New State Created',
        react: StateCreatedTemplate(emailData),
      });
      if (error) {
        throw error;
      } else {
        return data;
      }
    } catch (error) {
      throw new EmailError('An error occured sending the state created email', error);
    }
  }

  private async sendAnnotationCreated(emailData: emailTypes.iAnnotationCreatedData) {
    try {
      const {data, error} = await this.client!.emails.send({
        from: this.fromField,
        to: emailData.emails,
        subject: 'Glyphx: New State Created',
        react: AnnotationCreatedTemplate(emailData),
      });
      if (error) {
        throw error;
      } else {
        return data;
      }
    } catch (error) {
      throw new EmailError('An error occured sending the thread created email', error);
    }
  }

  private async sendWorkspaceCreated(emailData: emailTypes.iWorkspaceCreatedData) {
    try {
      const {data, error} = await this.client!.emails.send({
        from: this.fromField,
        to: [emailData.email],
        subject: 'Glyphx: New Workspace Created',
        react: WorkspaceCreatedTemplate(emailData),
      });
      if (error) {
        throw error;
      } else {
        return data;
      }
    } catch (error) {
      throw new EmailError('An error occured sending the workspace created email', error);
    }
  }

  private async sendWorkspaceInvitation(emailData: emailTypes.iWorkspaceInvitationData) {
    try {
      console.log({emails: emailData.emails, client: true});
      const emails = emailData?.emails;
      const {data, error} = await this.client!.emails.send({
        from: this.fromField,
        to: emails,
        subject: 'Glyphx: New Workspace Invitation',
        react: WorkspaceInvitationTemplate(emailData),
      });
      if (error) {
        throw error;
      } else {
        return data;
      }
    } catch (error) {
      throw new EmailError('An error occured sending the workspace invitation email', error);
    }
  }

  private async sendWorkspaceJoined(emailData: emailTypes.iWorkspaceJoinedData) {
    try {
      const {data, error} = await this.client!.emails.send({
        from: this.fromField,
        to: [emailData.email],
        subject: 'Glyphx: Joined Workspace',
        react: WorkspaceJoinedTemplate(emailData),
      });

      if (error) {
        throw error;
      } else {
        return data;
      }
    } catch (error) {
      throw new EmailError('An error occured sending the workspace joined email', error);
    }
  }
}
