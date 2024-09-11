import { Role } from "../../enterprise/entities/authenticate.ts";
import { Search, type SearchCourse, type SearchPole } from "../../enterprise/entities/search.ts";

export interface SearchManyDetails {
  query: string
  page: number
  role: Role

  courses?: SearchCourse[]
  poles?: SearchPole[]
}

export abstract class SearchsRepository {
  abstract searchManyDetails({ query, page, role, courses, poles }: SearchManyDetails): Promise<{
    searchs: Search[]
    pages: number
    totalItems: number
  }>
}