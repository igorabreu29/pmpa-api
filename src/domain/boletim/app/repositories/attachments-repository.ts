import { Attachment } from "../../enterprise/entities/attachment.ts";

export abstract class AttachmentsRepository {
  abstract findByCourseId(courseId: string): Promise<Attachment | null>
}