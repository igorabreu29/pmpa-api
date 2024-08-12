import { Role } from "../../enterprise/entities/authenticate.ts";
import { Course } from "../../enterprise/entities/course.ts";
import { Pole } from "../../enterprise/entities/pole.ts";
import { Search } from "../../enterprise/entities/search.ts";

export interface SearchManyDetails {
  query: string
  page: number
  role: Role

  courses?: Course[]
  poles?: Pole[]
}

export abstract class SearchsRepository {
  abstract searchManyDetails({ query, page, role, courses, poles }: SearchManyDetails): Promise<{
    searchs: Search[]
    pages: number
    totalItems: number
  }>
}