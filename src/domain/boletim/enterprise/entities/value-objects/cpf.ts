import { Either, left, right } from "@/core/either.ts"
import { ValueObject } from "@/core/entities/value-object.ts"
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts"

interface CPFProps {
  cpf: string
}

export class CPF extends ValueObject<CPFProps> {
  get value(): string {
    return this.props.cpf
  }

  static validate(cpf: string): boolean {
    if (!cpf || cpf.trim().length > 14) {
      return false
    }

    const regex =
      /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/

    if (!regex.test(cpf)) {
      return false
    }

    return true
  }

  static format(cpf: string) {
    return cpf
      .trim()
      .replace(/\D/g, '')
  }

  static create(cpf: string): Either<InvalidCPFError, CPF> {
    if (!this.validate(cpf)) {
      return left(new InvalidCPFError())
    }

    const formattedcpf = this.format(cpf)

    return right(new CPF({ cpf: formattedcpf }))
  }
}