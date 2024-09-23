import { DomainEvents } from "@/core/events/domain-events.ts";
import { AdministratorsRepository, SearchAdministratorsDetails, type FindManyProps } from "@/domain/boletim/app/repositories/administrators-repository.ts";
import { Administrator } from "@/domain/boletim/enterprise/entities/administrator.ts";

export class InMemoryAdministratorsRepository implements AdministratorsRepository {
  public items: Administrator[] = []

  async findById(id: string): Promise<Administrator | null> {
    const admin = this.items.find(item => item.id.toValue() === id)
    return admin ?? null
  }

  async findByCPF(cpf: string): Promise<Administrator | null> {
    const admin = this.items.find(item => item.cpf.value === cpf)
    return admin ?? null
  }

  async findByEmail(email: string): Promise<Administrator | null> {
    const admin = this.items.find(item => item.email.value === email)
    return admin ?? null
  }

  async findMany({ page, cpf, username, isEnabled = true }: FindManyProps): Promise<
    { 
      administrators: Administrator[]; 
      pages: number; 
      totalItems: number; 
    }
  > {
    const PER_PAGE = 10

    const allAdministrators = this.items
      .filter(item => {
        return item.cpf.value.includes(cpf ?? '')
          && item.username.value.toLowerCase().includes(username ? username.toLowerCase() : '') 
          && isEnabled ? item.isActive : !item.isActive
      })
      .sort((adminA, adminB) => adminA.createdAt.getTime() - adminB.createdAt.getTime())

    const totalItems = allAdministrators.length
    const pages = Math.ceil(totalItems / PER_PAGE)
    const administrators = allAdministrators.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    return {
      administrators,
      pages,
      totalItems
    }
  }

  async searchManyDetails({ query, page }: SearchAdministratorsDetails): Promise<Administrator[]> {
    const PER_PAGE = 10

    const administrators = this.items
      .filter(item => {
        return item.username.value.toLowerCase().includes(query.toLowerCase())
      })
      .slice((page - 1) * PER_PAGE, page * PER_PAGE)
      .sort((administratorA, administratorB) => {
        return administratorA.username.value.localeCompare(administratorB.username.value)
      })

    return administrators
  }

  async create(admin: Administrator): Promise<void> {
    this.items.push(admin)

    DomainEvents.dispatchEventsForAggregate(admin.id)
  }

  async save(admin: Administrator): Promise<void> {
    const adminIndex = this.items.findIndex(item => item.equals(admin))
    this.items[adminIndex] = admin

    DomainEvents.dispatchEventsForAggregate(admin.id)
  }

  async delete(admin: Administrator): Promise<void> {
    const adminIndex = this.items.findIndex(item => item.equals(admin))
    this.items.splice(adminIndex, 1)

    DomainEvents.dispatchEventsForAggregate(admin.id)
  }
}