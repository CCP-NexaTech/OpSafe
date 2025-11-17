import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConsoleMailProvider {
  private readonly logger = new Logger(ConsoleMailProvider.name);

  async sendInvitationEmail(params: {
    toEmail: string;
    toName: string;
    organizationName: string;
    invitationToken: string;
  }): Promise<void> {
    const invitationLink = `https://app.opsafe.com.br/accept-invite?token=${encodeURIComponent(
      params.invitationToken,
    )}`;

    this.logger.log(
      [
        'Simulando envio de e-mail de convite:',
        `Para: ${params.toName} <${params.toEmail}>`,
        `Organização: ${params.organizationName}`,
        `Link: ${invitationLink}`,
      ].join('\n'),
    );
  }
}
