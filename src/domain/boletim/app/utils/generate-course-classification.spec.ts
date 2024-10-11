import { describe, it, expect } from 'vitest'
import { classificationByCourseFormula } from './generate-course-classification.ts'
import { StudentClassficationByModule, StudentClassficationByPeriod } from '../types/generate-students-classification.js'
import { generateBehaviorAverage } from './generate-behavior-average.ts'
import { GenerateBehaviorStatus } from './get-behavior-average-status.ts'
import { Status } from './get-assessment-average-status.ts'

describe('Generate Students Classification', () => {
  it ('should be able to generate students classification by period', () => {
    const behaviorMonths = [
      {
        august: 7,
        september: 7,
        october: 7,
        november: 8,
        december: 8,
        january: 9.5,
        module: 1
      },
      {
        february: 7.5,
        march: 6.2,
        module: 2
      },
    ]

    const behaviorAverageByPeriod = generateBehaviorAverage({ isPeriod: true, behaviorMonths })

    const studentsWithAverage: StudentClassficationByPeriod[] = [
      {
        studentAverage: {
          assessmentsPerPeriod: {
            module1: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: 10,
                module: 1,
                average: 6.5,
                isRecovering: true,
                status: 'approved' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],

            module2: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: null,
                module: 2,
                average: 6,
                isRecovering: false,
                status: 'second season' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1',
              }
            ],

            module3: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: 10,
                module: 3,
                average: 6.5,
                isRecovering: true,
                status: 'approved second season' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],
          },
          assessments: [],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season',
            },
            behaviorsCount: behaviorAverageByPeriod.behaviorsCount
          },
          assessmentsCount: 3
        },
        studentBirthday: new Date(2001, 5, 12)
      },

      {
        studentAverage: {
          assessmentsPerPeriod: {
            module1: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: 10,
                module: 1,
                average: 6.5,
                isRecovering: true,
                status: 'approved' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],

            module2: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: null,
                module: 2,
                average: 6,
                isRecovering: false,
                status: 'second season' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],
            module3: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: 10,
                module: 3,
                average: 6.5,
                isRecovering: true,
                status: 'approved second season' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],
          },
          assessments: [],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: behaviorAverageByPeriod.behaviorsCount
          },
          assessmentsCount: 10
        },
        studentBirthday: new Date(1990, 5, 12)
      }
    ]

    const result = classificationByCourseFormula['CFO']((studentsWithAverage as StudentClassficationByPeriod[]))

    expect(result).toMatchObject([
      {
        studentAverage: result[0].studentAverage,
        studentBirthday: result[0].studentBirthday
      },
      {
        studentAverage: result[1].studentAverage,
        studentBirthday: result[1].studentBirthday
      },
    ])
  })

  it ('should be able to generate students classification by module', () => {
    const behaviorMonths = [
      {
        august: 7,
        september: 7,
        october: 7,
        november: 8,
        december: 8,
        january: 9.5,
        module: 1
      },
      {
        february: 7.5,
        march: 6.2,
        module: 1
      },
    ]

    const behaviorAverageByPeriod = generateBehaviorAverage({ isPeriod: true, behaviorMonths })

    const studentsWithAverage: StudentClassficationByPeriod[] = [
      {
        studentAverage: {
          assessmentsPerPeriod: {
            module1: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: 10,
                module: 1,
                average: 6.5,
                isRecovering: true,
                status: 'approved' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],

            module2: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: null,
                module: 2,
                average: 6,
                isRecovering: false,
                status: 'second season' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],

            module3: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: 10,
                module: 3,
                average: 6.5,
                isRecovering: true,
                status: 'approved second season' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],
          },
          assessments: [],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: behaviorAverageByPeriod.behaviorsCount
          },
          assessmentsCount: 3
        },
        studentBirthday: new Date(2001, 5, 12)
      },

      {
        studentAverage: {
          assessmentsPerPeriod: {
            module1: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: 10,
                module: 1,
                average: 6.5,
                isRecovering: true,
                status: 'approved' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],

            module2: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: null,
                module: 2,
                average: 6,
                isRecovering: false,
                status: 'second season' as Status,
                                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],
            module3: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: 10,
                module: 3,
                average: 6.5,
                isRecovering: true,
                status: 'approved second season' as Status,
                courseId: 'course-1',
                disciplineId: 'discipline-1'
              }
            ],
          },
          assessments: [],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: behaviorAverageByPeriod.behaviorsCount
          },
          assessmentsCount: 10
        },
        studentBirthday: new Date(1990, 5, 12)
      }
    ]

    const result = classificationByCourseFormula['CFO']((studentsWithAverage as StudentClassficationByPeriod[]))

    expect(result).toMatchObject([
      {
        studentAverage: result[0].studentAverage,
        studentBirthday: result[0].studentBirthday
      },
      {
        studentAverage: result[1].studentAverage,
        studentBirthday: result[1].studentBirthday
      },
    ])
  })

  it ('should be able to generate students classification by course CAS formula', () => {
    const behaviorMonths = [
      {
        august: 7,
        september: 7,
        october: 7,
        november: 8,
        december: 8,
        january: 9.5,
        module: 1
      },
      {
        february: 7.5,
        march: 6.2,
        module: 1
      },
    ]

    const behaviorAverageByPeriod = generateBehaviorAverage({ behaviorMonths })

    const studentsWithAverage: StudentClassficationByModule[] = [
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
            {
              id: 'assessment-2',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
          ],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 6
        },
        studentBirthday: new Date(2001, 5, 12)
      },
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
            {
              id: 'assessment-2',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
          ],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 6
        },
        studentBirthday: new Date(1990, 5, 12)
      }
    ]

    const result = classificationByCourseFormula['CAS'](studentsWithAverage) 

    expect(result).toMatchObject([
      {
        studentAverage: result[0].studentAverage,
        studentBirthday: result[0].studentBirthday
      },
      {
        studentAverage: result[1].studentAverage,
        studentBirthday: result[1].studentBirthday
      },
    ])
  })

  it ('should be able to generate students classification by course CGS formula', () => {
    const behaviorMonths = [
      {
        august: 7,
        september: 7,
        october: 7,
        november: 8,
        december: 8,
        module: 1
      },
      {
        january: 9.5,
        february: 7.5,
        march: 6.2,
        module: 1
      },
    ]

    const behaviorAverageByPeriod = generateBehaviorAverage({ behaviorMonths })

    const studentsWithAverage: StudentClassficationByModule[] = [
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
            {
              id: 'assessment-2',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
          ],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 6
        },
        studentBirthday: new Date(2001, 5, 12)
      },
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
            {
              id: 'assessment-2',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
          ],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 6
        },
        studentBirthday: new Date(1990, 5, 12)
      }
    ]

    const result = classificationByCourseFormula['CAS'](studentsWithAverage) 

    expect(result).toMatchObject([
      {
        studentAverage: result[0].studentAverage,
        studentBirthday: result[0].studentBirthday
      },
      {
        studentAverage: result[1].studentAverage,
        studentBirthday: result[1].studentBirthday
      },
    ])
  })

  it ('should be able to generate students classification by course CPF formula', () => {
    const behaviorMonths = [
      {
        august: 7,
        september: 7,
        october: 7,
        november: 8,
        december: 8,
        module: 1
      },
      {
        january: 9.5,
        february: 7.5,
        march: 6.2,
        module: 1
      },
    ]

    const behaviorAverageByPeriod = generateBehaviorAverage({ behaviorMonths })

    const studentsWithAverage: StudentClassficationByModule[] = [
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
            {
              id: 'assessment-2',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
          ],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 6
        },
        studentBirthday: new Date(2001, 5, 12)
      },
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
            {
              id: 'assessment-2',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status,
              courseId: 'course-1',
              disciplineId: 'discipline-1'
            },
          ],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 6
        },
        studentBirthday: new Date(1990, 5, 12)
      }
    ]

    const result = classificationByCourseFormula['CAS'](studentsWithAverage) 

    expect(result).toMatchObject([
      {
        studentAverage: result[0].studentAverage,
        studentBirthday: result[0].studentBirthday
      },
      {
        studentAverage: result[1].studentAverage,
        studentBirthday: result[1].studentBirthday
      },
    ])
  })
})