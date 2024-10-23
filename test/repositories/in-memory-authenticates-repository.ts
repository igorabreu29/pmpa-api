import { AuthenticatesRepository } from "@/domain/boletim/app/repositories/authenticates-repository.ts";
import { Authenticate } from "@/domain/boletim/enterprise/entities/authenticate.ts";

export class InMemoryAuthenticatesRepository implements AuthenticatesRepository {
  public items: Authenticate[] = []

  async findById({ id }: { id: string; }): Promise<Authenticate | null> {
    const authenticate = this.items.find(item => item.id.toValue() === id) 
    return authenticate ?? null
  }

  async findByCPF({ cpf }: { cpf: string; }): Promise<Authenticate | null> {
    const authenticate = this.items.find(item => item.cpf.value === cpf) 
    return authenticate ?? null
  }

  async findByEmail({ email }: { email: string; }): Promise<Authenticate | null> {
    const authenticate = this.items.find(item => item.email.value === email) 
    return authenticate ?? null
  }

  async save(authenticate: Authenticate): Promise<void> {
    const authenticateIndex = this.items.findIndex(item => item.equals(authenticate)) 
    this.items[authenticateIndex] = authenticate
  }
}