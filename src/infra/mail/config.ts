import nodemailer from 'nodemailer'
import { env } from '../env/index.ts'
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

const configTransporterTest = {
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'remington.beatty@ethereal.email',
      pass: '3Fkm1nRq7D6bcrXsgx'
  }
}

const configTransporter = {
  service: 'gmail',
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS
  }
}

export let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>

if (env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport(configTransporter)
} else {
  transporter = nodemailer.createTransport(configTransporterTest)
}