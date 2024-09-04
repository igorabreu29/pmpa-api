export class ClientError extends Error {
  constructor(message?: string) {
    super(message ?? 'Ocurred something problem.')
  }
}