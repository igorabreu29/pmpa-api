import type { Mailer } from "@/domain/boletim/app/mail/mailer.ts";

export class FakeMailer implements Mailer {
  async sendMail({ from, to }: { from: string, to: string }) {
    return {
      from,
      to,
      subject: 'Forgot password',
      text: 'Click here to restore your password.'
    }
  }
}