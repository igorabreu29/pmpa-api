import { describe, expect, it } from "vitest";
import { Status } from "../get-assessment-average-status.ts";
import { GenerateBehaviorStatus } from "../get-behavior-average-status.ts";
import { StudentClassficationByModule } from "../../types/generate-students-classification.js";
import { generateBehaviorAverage } from "../generate-behavior-average.ts";
import { classifyStudentsByCFPFormula, classifyStudentsByCGSAndCASFormula } from "./classify-students-by-formula.ts";

describe('Classify Students By Formula', () => {
  it ('should be able to classify students by CFP formula', () => {
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

    const behaviorAverageByPeriod = generateBehaviorAverage({ behaviorMonths })

    const studentsWithAverage: StudentClassficationByModule[] = [
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
              vf: 9,
              avi: 7,
              avii: 8,
              module: 1,
              average: 8,
              isRecovering: false,
              status: 'approved' as Status
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
              id: 'assessment-3',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status
            },
            {
              id: 'assessment-4',
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
    
    const result = classifyStudentsByCFPFormula(studentsWithAverage)
    
    expect(result).toMatchObject([
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-3',
            },
            {
              id: 'assessment-4',
            },
          ]
        },
      },
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
            },
            {
              id: 'assessment-2',
            },
          ]
        }
      }
    ])
  })

  it ('should be able to classify students by CGS And CAS formula', () => {
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

    const behaviorAverageByPeriod = generateBehaviorAverage({ behaviorMonths })

    const studentsWithAverage: StudentClassficationByModule[] = [
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
              vf: 9,
              avi: 7,
              avii: 8,
              module: 1,
              average: 8,
              isRecovering: false,
              status: 'approved' as Status
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
              id: 'assessment-3',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status
            },
            {
              id: 'assessment-4',
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

    const result = classifyStudentsByCGSAndCASFormula(studentsWithAverage)

    expect(result).toMatchObject([
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-1',
              status: 'approved'
            },
            {
              id: 'assessment-2',
              status: 'second season'
            },
          ]
        },
      },
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-3',
              status: 'second season'
            },
            {
              id: 'assessment-4',
              status: 'second season'
            },
          ]
        }
      },
    ])
  })
})