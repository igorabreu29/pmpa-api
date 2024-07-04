import { UserPole } from "@/domain/boletim/enterprise/entities/user-pole.ts";

export abstract class UserPolesRepository {
  abstract findByUserId({ userId }: { userId: string }): Promise<UserPole | null>
  abstract findByPoleIdAndUserId({ poleId, userId }: { poleId: string, userId: string }): Promise<UserPole | null>
  abstract create(userPole: UserPole): Promise<void>
  abstract createMany(usersOnPoles: UserPole[]): Promise<void>
}