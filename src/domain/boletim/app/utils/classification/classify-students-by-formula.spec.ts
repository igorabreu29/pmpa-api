import { describe, expect, it } from "vitest";
import { Status } from "../get-assessment-average-status.ts";
import { GenerateBehaviorStatus } from "../get-behavior-average-status.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../../types/generate-students-classification.js";
import { generateBehaviorAverage } from "../generate-behavior-average.ts";
import { classifyStudentsByCFOFormula, classifyStudentsByCFPFormula, classifyStudentsByCGSAndCASFormula, classifyStudentsByCHOFormula } from "./classify-students-by-formula.ts";

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

  it ('should be able to classify students by CHO formula', () => {
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
            geralAverage: 6.5,
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
              vf: 9,
              avi: 7,
              avii: 8,
              module: 1,
              average: 8,
              isRecovering: false,
              status: 'approved' as Status
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
            geralAverage: 8,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 6
        },
        studentBirthday: new Date('2000-12-01')
      },
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-5',
              vf: 10,
              avi: 8,
              avii: 4,
              module: 1,
              average: 7.3,
              isRecovering: false,
              status: 'approved' as Status
            },
            {
              id: 'assessment-6',
              vf: 7,
              avi: 8,
              avii: 8,
              module: 1,
              average: 7.6,
              isRecovering: false,
              status: 'approved' as Status
            },
          ],

          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 8,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 6
        },
        studentBirthday: new Date('1999-12-01')
      },
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-7',
              vf: 10,
              avi: 8,
              avii: 4,
              module: 1,
              average: 7.3,
              isRecovering: false,
              status: 'approved' as Status
            },
            {
              id: 'assessment-8',
              vf: 7,
              avi: 8,
              avii: 8,
              module: 1,
              average: 7.6,
              isRecovering: false,
              status: 'approved' as Status
            },
          ],

          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 9,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved'
            },
            behaviorsCount: 8
          },
          assessmentsCount: 6
        },
        studentBirthday: new Date('1999-12-01')
      },
      {
        studentAverage: {
          assessments: [
            {
              id: 'assessment-9',
              vf: 9,
              avi: 7,
              avii: 8,
              module: 1,
              average: 8,
              isRecovering: false,
              status: 'approved' as Status
            },
            {
              id: 'assessment-10',
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
            geralAverage: 10,
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
              id: 'assessment-11',
              vf: 7,
              avi: 5,
              avii: 8,
              module: 1,
              average: 6.67,
              isRecovering: false,
              status: 'second season' as Status
            },
            {
              id: 'assessment-12',
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
            geralAverage: 6.5,
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

    const result = classifyStudentsByCHOFormula(studentsWithAverage)

    expect(result).toMatchObject([
      {
        studentAverage: {
          averageInform: {
            geralAverage: 9,
            studentAverageStatus: {
              status: 'approved'
            }
          }
        }
      },
      {
        studentAverage: {
          averageInform: {
            geralAverage: 8,
            studentAverageStatus: {
              status: 'approved'
            }
          }
        }
      },
      {
        studentAverage: {
          averageInform: {
            geralAverage: 8,
            studentAverageStatus: {
              status: 'approved'
            }
          }
        }
      },
      {
        studentAverage: {
          averageInform: {
            geralAverage: 10,
            studentAverageStatus: {
              status: 'approved second season'
            }
          }
        }
      },
      {
        studentAverage: {
          averageInform: {
            geralAverage: 6.5,
            studentAverageStatus: {
              status: 'approved second season'
            }
          }
        }
      },
      {
        studentAverage: {
          averageInform: {
            geralAverage: 6.5,
            studentAverageStatus: {
              status: 'approved second season'
            }
          }
        }
      },
    ])
  })
  
  it ('should be able to classify students by CFO formula', () => {
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

    const behaviorAverageByPeriod = generateBehaviorAverage({ behaviorMonths, isPeriod: true })

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
                status: 'approved' as Status
              }
            ],

            module2: [
              {
                id: 'assessment-2',
                vf: 7,
                avi: 7,
                avii: null,
                vfe: null,
                module: 2,
                average: 7,
                isRecovering: false,
                status: 'approved' as Status
              }
            ],

            module3: [
              {
                id: 'assessment-3',
                vf: 7,
                avi: 7,
                avii: null,
                vfe: null,
                module: 2,
                average: 7,
                isRecovering: false,
                status: 'approved' as Status
              }
            ],
          },
          assessments: [],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 7.25,
            studentAverageStatus: {
              concept: 'regular',
              status: 'approved',
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
                id: 'assessment-4',
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
                id: 'assessment-5',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: null,
                module: 2,
                average: 6,
                isRecovering: false,
                status: 'second season' as Status
              }
            ],
            module3: [
              {
                id: 'assessment-6',
                vf: 7,
                avi: 5,
                avii: null,
                vfe: 10,
                module: 3,
                average: 6.5,
                isRecovering: true,
                status: 'approved second season' as Status
              }
            ],
          },
          assessments: [],
          averageInform: {
            behaviorAverageStatus: behaviorAverageByPeriod.behaviorAverageStatus as GenerateBehaviorStatus[],
            geralAverage: 7.25,
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

    const result = classifyStudentsByCFOFormula(studentsWithAverage)

    expect(result).toMatchObject([
      {
        studentAverage: {
          averageInform: {
            studentAverageStatus: {
              status: 'approved'
            }
          }
        }
      },
      {
        studentAverage: {
          averageInform: {
            studentAverageStatus: {
              status: 'approved second season'
            }
          }
        }
      },
    ])
  })
})