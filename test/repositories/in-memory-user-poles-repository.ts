import { UserPolesRepository } from "@/domain/boletim/app/repositories/user-poles-repository.ts";
import { UserPole } from "@/domain/boletim/enterprise/entities/user-pole.ts";

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

  async createMany(usersOnPoles: UserPole[]): Promise<void> {
    usersOnPoles.forEach(userOnPole => {
      this.items.push(userOnPole)
    })
  }
}