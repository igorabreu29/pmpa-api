import { Authenticate } from "../../enterprise/entities/authenticate.ts";

export abstract class AuthenticatesRepository {
  abstract findByCPF({ cpf }: { cpf: string }): Promise<Authenticate | null>
  abstract findByEmail({ email }: { email: string }): Promise<Authenticate | null>
  abstract save(authenticate: Authenticate): Promise<void>
}