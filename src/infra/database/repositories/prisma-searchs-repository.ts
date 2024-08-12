import { SearchManyDetails, SearchsRepository } from "@/domain/boletim/app/repositories/searchs-repository.ts";
import { Search } from "@/domain/boletim/enterprise/entities/search.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaSearchsDetailsMapper } from "../mappers/prisma-searchs-mapper.ts";
import { PrismaCoursesMapper } from "../mappers/prisma-courses-mapper.ts";
import { PrismaPolesMapper } from "../mappers/prisma-poles-mapper.ts";

export class PrismaSearchsRepository implements SearchsRepository {
  async searchManyDetails({ query, page, role, courses, poles }: SearchManyDetails): Promise<{ searchs: Search[]; pages: number; totalItems: number; }> {
    const PER_PAGE = 10

    if (role === 'manager') {
      const searchs = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          username: {
            contains: query
          },
        },

        skip: (page - 1) * PER_PAGE,
        take: page * PER_PAGE,

        select: {
          username: true,
          cpf: true,
          email: true,
          civilId: true,
          role: true,
          usersOnCourses: {
            select: {
              course: true,
              usersOnPoles: {
                select: {
                  pole: true
                }
              }
            }
          }   
        }
      })

      const searchMapperToDomain = searchs
        .map(search => ({
          username: search.username,
          civilId: search.civilId,
          cpf: search.cpf,
          email: search.email,
          role: search.role,
          courses: search.usersOnCourses.map(item => item.course),
          poles: search.usersOnCourses.map(item => item.usersOnPoles[0].pole)
        }))
        .filter(search => {
          return search.courses.some(course => courses?.includes(PrismaCoursesMapper.toDomain(course))) &&
            search.poles.some(pole => poles?.includes(PrismaPolesMapper.toDomain(pole)))
        })

        const searchsCount = await prisma.user.count({
          where: {
            role: 'STUDENT'
          }
        })
        const pages = Math.ceil(searchsCount / PER_PAGE)
  
        return {
          searchs: searchMapperToDomain.map(searchMapper => PrismaSearchsDetailsMapper.toDomain(searchMapper)),
          pages,
          totalItems: searchsCount
        }
    }

    if (role === 'admin') {
      const searchs = await prisma.user.findMany({
        where: {
          role: {
            not: 'DEV'
          },
          username: {
            contains: query
          }
        },

        skip: (page - 1) * PER_PAGE,
        take: page * PER_PAGE,

        include: {
          usersOnCourses: {
            select: {
              course: true,
              usersOnPoles: {
                select: {
                  pole: true
                }
              }
            }
          }   
        }
      })

      const searchMapperToDomain = searchs.map(search => ({
        username: search.username,
        civilId: search.civilId,
        cpf: search.cpf,
        email: search.email,
        courses: search.usersOnCourses.map(item => item.course),
        poles: search.usersOnCourses.map(item => item.usersOnPoles[0].pole)
      }))

      const searchsCount = await prisma.user.count({
        where: {
          role: {
            not: 'DEV'
          },
        }
      })
      const pages = Math.ceil(searchsCount / PER_PAGE)

      return {
        searchs: searchMapperToDomain.map(searchMapper => PrismaSearchsDetailsMapper.toDomain(searchMapper)),
        pages,
        totalItems: searchsCount
      }
    }

    const searchs = await prisma.user.findMany({
      where: {
        username: {
          contains: query
        }
      },

      skip: (page - 1) * PER_PAGE,
      take: page * PER_PAGE,

      include: {
        usersOnCourses: {
          select: {
            course: true,
            usersOnPoles: {
              select: {
                pole: true
              }
            }
          }
        }   
      }
    })

    const searchMapperToDomain = searchs.map(search => ({
      username: search.username,
      civilId: search.civilId,
      cpf: search.cpf,
      email: search.email,
      courses: search.usersOnCourses.map(item => item.course),
      poles: search.usersOnCourses.map(item => item.usersOnPoles[0].pole)
    }))

    const searchsCount = await prisma.user.count({
      where: {
        role: {
          not: 'DEV'
        },
      }
    })
    const pages = Math.ceil(searchsCount / PER_PAGE)

    return {
      searchs: searchMapperToDomain.map(searchMapper => PrismaSearchsDetailsMapper.toDomain(searchMapper)),
      pages,
      totalItems: searchsCount
    }
  }
}