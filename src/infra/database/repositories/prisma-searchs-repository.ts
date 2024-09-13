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
          OR: [
            {
              username: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              cpf: {
                contains: query
              }
            }
          ]
        },

        orderBy: {
          username: 'asc'
        },

        skip: (page - 1) * PER_PAGE,
        take: page * PER_PAGE,

        select: {
          id: true,
          username: true,
          cpf: true,
          email: true,
          civilId: true,
          role: true,
          usersOnCourses: {
            include: {
              course: true,
              usersOnPoles: {
                include: {
                  pole: true
                }
              }
            }
          }   
        }
      })

      const searchMapperToDomain = searchs
        .map(search => ({
          id: search.id,
          username: search.username,
          civilId: search.civilId,
          cpf: search.cpf,
          email: search.email,
          role: search.role,
          searchCourses: search.usersOnCourses.map(userOnCourse => ({
            id: userOnCourse.id,
            courseId: userOnCourse.courseId,
            userId: userOnCourse.userId,
          })),
          searchPoles: search.usersOnCourses.map(userOnCourse => {
            return {
              id: userOnCourse.usersOnPoles[0].id,
              poleId: userOnCourse.usersOnPoles[0].poleId,
              userOnCourseId: userOnCourse.usersOnPoles[0].userOnCourseId,
            }
          }),
          courses: search.usersOnCourses.map(item => item.course),
          poles: search.usersOnCourses.map(item => item.usersOnPoles[0].pole)
        }))
        .filter(search => {
          return search.courses.some(item => {
            const courseMapper = PrismaCoursesMapper.toDomain(item)
            return courses?.some(({ course }) => course.id.equals(courseMapper.id))
          }) &&
            search.poles.some(pole => {
              const poleMapper = PrismaPolesMapper.toDomain(pole)
              return poles?.some(({ pole }) => pole.id.equals(poleMapper.id))
            })
        })

        const searchsCount = await prisma.user.count({
          where: {
            role: 'STUDENT',
            OR: [
              {
                username: {
                  contains: query
                }
              },
              {
                cpf: {
                  contains: query
                }
              }
            ]
          },
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
          NOT: {
            OR: [
              {
                role: 'DEV',
              },
              {
                role: 'ADMIN'
              }
            ]
          },
          OR: [
            {
              username: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              cpf: {
                contains: query
              }
            }
          ]
        },

        orderBy: {
          username: 'asc'
        },

        skip: (page - 1) * PER_PAGE,
        take: page * PER_PAGE,

        select: {
          id: true,
          username: true,
          cpf: true,
          email: true,
          civilId: true,
          role: true,
          usersOnCourses: {
            include: {
              course: true,
              usersOnPoles: {
                include: {
                  pole: true
                }
              }
            }
          }, 
        }
      })

      const searchMapperToDomain = searchs.map(search => ({
        id: search.id,
        username: search.username,
        civilId: search.civilId,
        cpf: search.cpf,
        email: search.email,
        role: search.role,
        searchCourses: search.usersOnCourses.map(userOnCourse => ({
          id: userOnCourse.id,
          courseId: userOnCourse.courseId,
          userId: userOnCourse.userId,
        })),
        searchPoles: search.usersOnCourses.map(userOnCourse => {
          return {
            id: userOnCourse.usersOnPoles[0].id,
            poleId: userOnCourse.usersOnPoles[0].poleId,
            userOnCourseId: userOnCourse.usersOnPoles[0].userOnCourseId,
          }
        }),
        courses: search.usersOnCourses.map(item => item.course),
        poles: search.usersOnCourses.map(item => item.usersOnPoles[0].pole)
      }))

      const searchsCount = await prisma.user.count({
        where: {
          NOT: {
            OR: [
              {
                role: 'DEV',
              },
              {
                role: 'ADMIN'
              }
            ]
          },
          OR: [
            {
              username: {
                contains: query
              }
            },
            {
              cpf: {
                contains: query
              }
            }
          ]
        },
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
        OR: [
          {
            username: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            cpf: {
              contains: query
            }
          }
        ]
      },

      orderBy: {
        username: 'asc'
      },

      skip: (page - 1) * PER_PAGE,
      take: page * PER_PAGE,

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        civilId: true,
        role: true,
        usersOnCourses: {
          include: {
            course: true,
            usersOnPoles: {
              include: {
                pole: true
              }
            }
          }
        },  
      }
    })

    const searchMapperToDomain = searchs.map(search => ({
      id: search.id,
      username: search.username,
      civilId: search.civilId,
      cpf: search.cpf,
      email: search.email,
      role: search.role,
      searchCourses: search.usersOnCourses.map(userOnCourse => ({
        id: userOnCourse.id,
        courseId: userOnCourse.courseId,
        userId: userOnCourse.userId,
      })),
      searchPoles: search.usersOnCourses.map(userOnCourse => {
        return {
          id: userOnCourse.usersOnPoles[0].id,
          poleId: userOnCourse.usersOnPoles[0].poleId,
          userOnCourseId: userOnCourse.usersOnPoles[0].userOnCourseId,
        }
      }),
      courses: search.usersOnCourses.map(item => item.course),
      poles: search.usersOnCourses.map(item => item.usersOnPoles[0].pole)
    }))

    const searchsCount = await prisma.user.count({
      where: {
        OR: [
          {
            username: {
              contains: query
            }
          },
          {
            cpf: {
              contains: query
            }
          }
        ]
      },
    })
    const pages = Math.ceil(searchsCount / PER_PAGE)

    return {
      searchs: searchMapperToDomain.map(searchMapper => PrismaSearchsDetailsMapper.toDomain(searchMapper)),
      pages,
      totalItems: searchsCount
    }
  }
}