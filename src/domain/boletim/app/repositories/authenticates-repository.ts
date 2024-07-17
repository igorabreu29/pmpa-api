import { Authenticate } from "../../enterprise/entities/authenticate.ts";

export abstract class AuthenticatesRepository {
  abstract findByCPF({ cpf }: { cpf: string }): Promise<Authenticate | null>
}