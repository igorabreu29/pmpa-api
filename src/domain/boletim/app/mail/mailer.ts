export interface SendMailProps {
  from: string
  to: string
}

export interface Mailer {
  sendMail: ({ from, to }: SendMailProps) => Promise<Record<string, unknown>>
}