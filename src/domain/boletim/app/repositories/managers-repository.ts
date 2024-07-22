import { Manager } from "../../enterprise/entities/manager.ts";
import { ManagerDetails } from "../../enterprise/entities/value-objects/manager-details.ts";

export abstract class ManagersRepository {
  abstract findById(id: string): Promise<Manager | null>
  abstract findDetailsById(id: string): Promise<ManagerDetails | null>
  abstract findByCPF(cpf: string): Promise<Manager | null>
  abstract findByEmail(email: string): Promise<Manager | null>
  abstract create(manager: Manager): Promise<void>
  abstract save(manager: Manager): Promise<void>
  abstract delete(manager: Manager): Promise<void>
}