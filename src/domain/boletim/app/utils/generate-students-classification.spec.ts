import { describe, it, expect } from 'vitest'
import { classifyStudentsByModuleFormule, classifyStudentsByPeriodFormule } from './generate-students-classification.ts'
import { StudentClassficationByModule, StudentClassficationByPeriod } from '../types/generate-students-classification.js'
import { generateBehaviorAverage } from './generate-behavior-average.ts'
import { GenerateBehaviorStatus } from './get-behavior-average-status.ts'
import { Status } from './get-assessment-average-status.ts'

describe('Generate Students Classification', () => {
  it ('should be able to generate students classification by course period formule', () => {
    const behaviorMonths = [
      {
        august: 7,
        september: 7,
        october: 7,
        november: 8,
        december: 8,
      },
      {
        january: 9.5,
        february: 7.5,
        march: 6.2,
      },
    ]

    const behaviorAverageByPeriod = generateBehaviorAverage({ formule: 'period', behaviorMonths })

    const studentsWithAverage: StudentClassficationByPeriod[] = [
      {
        studentAverage: {
          assessments: {
            module1: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: 0,
                vfe: 10,
                module: 1,
                average: 6.5,
                isRecovering: true,
                status: 'approved' as Status
              }
            ],

            module2: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: 0,
                vfe: null,
                module: 2,
                average: 6.5,
                isRecovering: false,
                status: 'approved' as Status
              }
            ],
            module3: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: 0,
                vfe: 10,
                module: 3,
                average: 6.5,
                isRecovering: true,
                status: 'approved' as Status
              }
            ],
          },
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            status: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 10
        },
        studentBirthday: new Date(2001, 5, 12)
      },

      {
        studentAverage: {
          assessments: {
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
                status: 'approved' as Status
              }
            ],

            module2: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: 0,
                vfe: null,
                module: 2,
                average: 6.5,
                isRecovering: false,
                status: 'approved' as Status
              }
            ],
            module3: [
              {
                id: 'assessment-1',
                vf: 7,
                avi: 5,
                avii: 0,
                vfe: 10,
                module: 3,
                average: 6.5,
                isRecovering: true,
                status: 'approved' as Status
              }
            ],
          },
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            status: {
              concept: 'regular',
              status: 'approved second season'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 10
        },
        studentBirthday: new Date(1990, 5, 12)
      }
    ]

    const result = classifyStudentsByPeriodFormule(studentsWithAverage) 

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

  it ('should be able to generate students classification by course module formule', () => {
    const behaviorMonths = [
      {
        august: 7,
        september: 7,
        october: 7,
        november: 8,
        december: 8,
      },
      {
        january: 9.5,
        february: 7.5,
        march: 6.2,
      },
    ]

    const behaviorAverageByPeriod = generateBehaviorAverage({ formule: 'module', behaviorMonths })

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
              status: 'second season' as Status
            },
            {
              id: 'assessment-2',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status
            },
          ],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            status: {
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
              status: 'second season' as Status
            },
            {
              id: 'assessment-2',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status
            },
          ],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 6.500,
            status: {
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

    const result = classifyStudentsByModuleFormule(studentsWithAverage) 

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