import { ManagerPole } from "../../enterprise/entities/manager-pole.ts";

export abstract class ManagersPolesRepository {
  abstract findByManagerId({ managerId }: { managerId: string }): Promise<ManagerPole | null>
  abstract findByManagerIdAndPoleId({ managerId, poleId }: { managerId: string, poleId: string }): Promise<ManagerPole | null>
  abstract create(managerPole: ManagerPole): Promise<void>
}