import { AttachmentsRepository } from "@/domain/boletim/app/repositories/attachments-repository.ts";
import { Attachment } from "@/domain/boletim/enterprise/entities/attachment.ts";

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  public items: Attachment[] = []

  async findByCourseId(courseId: string): Promise<Attachment | null> {
    const attachment = this.items.find(item => item.courseId?.toValue() === courseId)
    return attachment ?? null
  }
}