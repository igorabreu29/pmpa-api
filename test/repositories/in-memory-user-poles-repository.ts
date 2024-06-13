import { UserPolesRepository } from "@/domain/app/repositories/user-poles-repository.ts";
import { UserPole } from "@/domain/enterprise/entities/user-pole.ts";

export class InMemoryUserPolesRepository implements UserPolesRepository {
  public items: UserPole[] = []

  async findByUserId({ userId }: { userId: string; }): Promise<UserPole | null> {
    const userPole = this.items.find(item => item.userId.toValue() === userId)
    return userPole ?? null
  }

  async findByPoleIdAndUserId({ poleId, userId }: { poleId: string; userId: string; }): Promise<UserPole | null> {
    const userPole = this.items.find(item => item.poleId.toValue() === poleId && item.userId.toValue() === userId)
    return userPole ?? null
  }

  async create(userPole: UserPole): Promise<void> {
    this.items.push(userPole)
  }
}