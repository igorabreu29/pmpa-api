export class NotAllowed extends Error {
  constructor(message?: string) {
    super(message ?? 'Nível de acesso inválido')
  }
}