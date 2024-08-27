import { SearchManyDetails, SearchsRepository } from "@/domain/boletim/app/repositories/searchs-repository.ts";
import { Search } from "@/domain/boletim/enterprise/entities/search.ts";

export class InMemorySearchsRepository implements SearchsRepository {
  public items: Search[] = []

  async searchManyDetails({ query, page, role, courses, poles}: SearchManyDetails): Promise<{
    searchs: Search[]
    pages: number
    totalItems: number
  }> {
    const PER_PAGE = 10

    if (role === 'manager') {
      const allSearchs = this.items
        .filter(item => {
          return item.username.value.toLowerCase().includes(query.toLowerCase()) ||
            item.cpf.value.toLowerCase().includes(query) &&
            item.role === 'student' &&
            item.courses?.some(course => courses?.includes(course)) && 
            item.poles?.some(pole => poles?.includes(pole))
        })
        .sort((a, b) => a.username.value.localeCompare(b.username.value))

      const totalItems = allSearchs.length
      const pages = Math.ceil(totalItems / PER_PAGE)
      const searchs = allSearchs.slice((page - 1) * PER_PAGE, page * PER_PAGE)

      return {
        searchs,
        pages,
        totalItems
      }
    }

    if (role === 'admin') {
      const allSearchs = this.items
        .filter(item => {
          return item.username.value.toLowerCase().includes(query.toLowerCase()) ||
            item.cpf.value.toLowerCase().includes(query) &&
            item.role !== 'dev'
        })
        .sort((a, b) => a.username.value.localeCompare(b.username.value))

        const totalItems = allSearchs.length
        const pages = Math.ceil(totalItems / PER_PAGE)
        const searchs = allSearchs.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  
        return {
          searchs,
          pages,
          totalItems
        }
    }

    const allSearchs = this.items
      .filter(item => item.username.value.toLowerCase().includes(query.toLowerCase()) || item.cpf.value.toLowerCase().includes(query))
      .sort((a, b) => a.username.value.localeCompare(b.username.value))
  
    const totalItems = allSearchs.length
    const pages = Math.ceil(totalItems / PER_PAGE)
    const searchs = allSearchs.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    return {
      searchs,
      pages,
      totalItems
    }
  }
}