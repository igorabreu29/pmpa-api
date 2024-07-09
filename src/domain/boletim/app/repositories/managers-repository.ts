import { Manager } from "../../enterprise/entities/manager.ts";
import { ManagerWithCourseAndPole } from "../../enterprise/entities/value-objects/manager-with-course-and-pole.ts";

export abstract class ManagersRepository {
  abstract findById(id: string): Promise<Manager | null>
  abstract findByCPF(cpf: string): Promise<Manager | null>
  abstract findByEmail(email: string): Promise<Manager | null>
  abstract create(manager: Manager): Promise<void>
  abstract save(manager: Manager): Promise<void>
}