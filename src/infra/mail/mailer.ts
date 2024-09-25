import type { Mailer, SendMailProps } from "@/domain/boletim/app/mail/mailer.ts"
import queue from "../queue/queue.ts"

export class Nodemailer implements Mailer {
  async sendMail({ from, to }: SendMailProps) {
    await queue.add('forgot-password-mail', { data: { from, to } })
 
    return {}
  }
}