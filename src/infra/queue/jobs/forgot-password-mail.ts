import { env } from "@/infra/env/index.ts"
import { transporter } from "@/infra/mail/config.ts"

export interface MailProps {
  data: {
    from: string
    to: string
  }
}

export const forgotPasswordMailConfig = {
  key: 'forgot-password-mail',
  async handle({ data }: MailProps) {
    const { from, to } = data

    await transporter.sendMail({
      from,
      to,
      subject: 'Boletim Acadêmico PMPA - Esqueci minha senha',
      html: `
        Olá, ao clicar na no botão, você será redirecionado para nossa plataforma, após o preenchimento, sua senha será redefinida.
        
        <button>
          <a target=_blank href=${env.WEB_URL}/restore?email=${to}>Restaure sua senha.</a>
        </button>
      `
    })
  }
}