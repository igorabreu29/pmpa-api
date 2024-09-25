export class ClientError extends Error {
  constructor(message?: string) {
    super(message ?? 'Houve algum problema')
  }
}