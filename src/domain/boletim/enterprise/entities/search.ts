import { Either, right } from "@/core/either.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { Optional } from "@/core/types/optional.ts";
import { CPF } from "./value-objects/cpf.ts";
import { Email } from "./value-objects/email.ts";
import { Name } from "./value-objects/name.ts";
import { Role } from "./authenticate.ts";
import { Course } from "./course.ts";
import { Pole } from "./pole.ts";
import { Entity } from "@/core/entities/entity.ts";

interface SearchProps {
  username: Name
  email: Email
  cpf: CPF
  role: Role
  civilId: number

  courses?: Course[]
  poles?: Pole[]
}

export class Search extends Entity<SearchProps> {
  get username() {
    return this.props.username
  }
  set username(value) {
    this.props.username = value
  }
  
  get email() {
    return this.props.email
  }
  set email(value) {
    this.props.email = value
  }

  get cpf(){
    return this.props.cpf
  }
  set cpf(value) {
    this.props.cpf = value
  }

  get role() {
    return this.props.role
  }

  get civilId() {
    return this.props.civilId
  }
  set civilId(value) {
    this.props.civilId = value
  }

  get courses() {
    return this.props.courses
  }

  get poles() {
    return this.props.poles
  }

  static create(
    props: Optional<SearchProps, 'role'>, 
    id?: UniqueEntityId): Either<
      | InvalidEmailError
      | InvalidCPFError
      | InvalidNameError 
      | InvalidPasswordError,
      Search
    > {

    const search = new Search({
      ...props,
      role: props.role ?? 'student'
    }, id)

    return right(search)
  }
}