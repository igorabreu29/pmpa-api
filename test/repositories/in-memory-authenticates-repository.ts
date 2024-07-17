import { AuthenticatesRepository } from "@/domain/boletim/app/repositories/authenticates-repository.ts";
import { Authenticate } from "@/domain/boletim/enterprise/entities/authenticate.ts";

export class InMemoryAuthenticatesRepository implements AuthenticatesRepository {
  public items: Authenticate[] = []

  async findByCPF({ cpf }: { cpf: string; }): Promise<Authenticate | null> {
    const authenticate = this.items.find(item => item.cpf.value === cpf) 
    return authenticate ?? null
  }
}