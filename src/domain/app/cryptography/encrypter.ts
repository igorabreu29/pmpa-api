export interface Encrypter {
  encrypt: (payload: Record<string, unknown>) => string
}