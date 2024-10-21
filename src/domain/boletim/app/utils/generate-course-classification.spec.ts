import { describe, it, expect } from 'vitest'
import { classificationByCourseFormula } from './generate-course-classification.ts'
import { StudentClassficationByModule, StudentClassficationByPeriod } from '../types/generate-students-classification.js'
import { generateBehaviorAverage } from './generate-behavior-average.ts'
import { GenerateBehaviorStatus } from './get-behavior-average-status.ts'
import { Status } from './get-assessment-average-status.ts'
import { makeClassification } from 'test/factories/make-classification.ts'

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

    const classification = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[0].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[0].status,
          behaviorsCount: 6
        },
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[1].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[1].status,
          behaviorsCount: 2
        }
      ],

      studentBirthday: new Date(2001, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const classification2 = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: 7.5,
          status: 'approved',
          behaviorsCount: 6
        },
        {
          behaviorAverage: 6.85,
          status: 'approved',
          behaviorsCount: 2
        }
      ],

      studentBirthday: new Date(1990, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const result = classificationByCourseFormula['CFO']([classification, classification2])

    expect(result).toMatchObject([
      {
        studentBirthday: result[0].studentBirthday
      },
      {
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

    const behaviorAverageByPeriod = generateBehaviorAverage({ isPeriod: false, behaviorMonths })

    const classification = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[0].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[0].status,
          behaviorsCount: 8
        },
      ],

      studentBirthday: new Date(2001, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const classification2 = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[0].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[0].status,
          behaviorsCount: 8
        },
      ],

      studentBirthday: new Date(1990, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const result = classificationByCourseFormula['CHO']([classification, classification2])

    expect(result).toMatchObject([
      {
        studentBirthday: result[0].studentBirthday
      },
      {
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

    const classification = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[0].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[0].status,
          behaviorsCount: 8
        },
      ],

      studentBirthday: new Date(2001, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const classification2 = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[0].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[0].status,
          behaviorsCount: 8
        },
      ],

      studentBirthday: new Date(1990, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const result = classificationByCourseFormula['CAS']([classification, classification2])

    expect(result).toMatchObject([
      {
        studentBirthday: result[0].studentBirthday
      },
      {
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

    const classification = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[0].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[0].status,
          behaviorsCount: 8
        },
      ],

      studentBirthday: new Date(2001, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const classification2 = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[0].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[0].status,
          behaviorsCount: 8
        },
      ],

      studentBirthday: new Date(1990, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const result = classificationByCourseFormula['CGS']([classification, classification2])

    expect(result).toMatchObject([
      {
        studentBirthday: result[0].studentBirthday
      },
      {
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

    const classification = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[0].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[0].status,
          behaviorsCount: 8
        },
      ],

      studentBirthday: new Date(2001, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const classification2 = makeClassification({
      assessmentsCount: 3,
      average: 6.500,
      concept: 'regular',
      status: 'approved second season',
      behavior: [
        {
          behaviorAverage: behaviorAverageByPeriod.behaviorAverageStatus[0].behaviorAverage,
          status: behaviorAverageByPeriod.behaviorAverageStatus[0].status,
          behaviorsCount: 8
        },
      ],

      studentBirthday: new Date(1990, 5, 12),
      
      assessments: [
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
        },
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
        },
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
      ]
    })

    const result = classificationByCourseFormula['CFP']([classification, classification2])

    expect(result).toMatchObject([
      {
        studentBirthday: result[0].studentBirthday
      },
      {
        studentBirthday: result[1].studentBirthday
      },
    ])
  })
})