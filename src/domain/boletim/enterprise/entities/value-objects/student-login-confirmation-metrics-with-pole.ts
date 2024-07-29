import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";

interface StudentLoginConfirmationMetricsWithPoleProps {
  studentId: UniqueEntityId
  isLoginConfirmed: boolean

  poleId: UniqueEntityId
  poleName: string
}

export class StudentLoginConfirmationMetricsWithPole extends ValueObject<StudentLoginConfirmationMetricsWithPoleProps> {
  get studentId() {
    return this.props.studentId
  }

  get isLoginConfirmed() {
    return this.props.isLoginConfirmed
  }

  get poleId() {
    return this.props.poleId
  }

  get poleName() {
    return this.props.poleName
  }
}