import { describe, expect, it } from "vitest";
import { formulas } from "./verify-formula.ts";
import { generateBehaviorAverage } from "./generate-behavior-average.ts";
import { Status } from "./get-assessment-average-status.ts";

describe('Verify Formulas', () => {
  describe("Period Formula", () => {
    it ('should be able to receive inform about average', () => {
      const assessments = [
        {
          id: 'assessment-1',
          vf: 7,
          avi: 5,
          avii: 0,
          vfe: 10,
          module: 1,
          average: 6.5,
          isRecovering: true,
          status: 'approved second season' as Status
        },
        {
          id: 'assessment-2',
          vf: 7,
          avi: 5,
          avii: 0,
          vfe: 10,
          module: 1,
          average: 6.5,
          isRecovering: true,
          status: 'approved second season' as Status
        },
        {
          id: 'assessment-3',
          vf: 7,
          avi: 5,
          avii: 0,
          vfe: 10,
          module: 2,
          average: 6.5,
          isRecovering: true,
          status: 'approved second season' as Status
        },
        {
          id: 'assessment-4',
          vf: 9,
          avi: 7,
          avii: 8,
          vfe: 0,
          module: 3,
          average: 8,
          isRecovering: false,
          status: 'approved' as Status
        },
      ]
      
      const behaviorMonths = [
        {
          january: 4,
          february: 7,
          march: 8,
          april: 4,
          may: 8,
          jun: 8,
        },
        {
          july: 4,
          august: 8.5,
          september: 6.75,
          october: 4,
          november: 8.5,
          december: 6.75,
        },
        {
          january: 8,
          february: 7,
          march: 9.5,
        },
      ]
      const behaviorAverage = generateBehaviorAverage({ behaviorMonths, isPeriod: true })
  
      const result = formulas['period']({ 
        assessments,
        behaviorAverage, 
      })

      expect(result).toMatchObject({
        averageInform: {
          geralAverage: 7.281,
          behaviorAverageStatus: expect.arrayContaining([
            expect.objectContaining({
              behaviorAverage: 6.5
            }),
            expect.objectContaining({
              behaviorAverage: 6.417
            }),
            expect.objectContaining({
              behaviorAverage: 8.167
            }),
          ]),
          studentAverageStatus: { concept: 'good', status: 'approved second season' }
        },
        
        assessments: expect.objectContaining({
          module1: [
            expect.objectContaining({
              id: assessments[0].id,
            }),
            expect.objectContaining({
              id: assessments[1].id,
            })
          ],
  
          module2: [
            expect.objectContaining({
              id: assessments[2].id,
            })
          ],
  
          module3: [
            expect.objectContaining({
              id: assessments[3].id,
            })
          ]
        })
      })
    })
  })

  describe('Module Formula', () => {
    it ('should be able to receive inform about average without behavior', () => {
      const assessments = [
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
          avii: 0,
          module: 1,
          average: 6,
          isRecovering: false,
          status: 'second season' as Status
        },
      ]

      const result = formulas['module']({
        assessments
      })

      expect(result).toMatchObject({
        averageInform: {
          geralAverage: 6.335,
          studentAverageStatus: { concept: 'regular', status: 'approved' },
          behaviorAverageStatus: []
        },
        
        assessments: [
            expect.objectContaining({
              id: 'assessment-1'
            }),
            expect.objectContaining({
              id: 'assessment-2'
            })
          ]
        })
    }) 

    it ('should be able to receive inform about average with behavior', () => {
      const assessments = [
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
          avii: 0,
          module: 1,
          average: 6,
          isRecovering: false,
          status: 'second season' as Status
        },
      ]

      const behaviorMonths = [
        {
          january: 4,
          february: 7,
          march: 8,
          april: 5,
          may: 7.5, 
          jun: 9.25,
          july: 7
        },
      ]

      const behaviorAverageStatus = generateBehaviorAverage({ behaviorMonths })

      const result = formulas['module']({
        assessments,
        behaviorAverage: behaviorAverageStatus
      })

      expect(result).toMatchObject({
        averageInform: {
          geralAverage: 6.578,
          studentAverageStatus: { concept: 'regular', status: 'approved' },
          behaviorAverageStatus: {
            behaviorAverage: 6.821,
            status: 'approved'
          }
        },
        
        assessments: [
            expect.objectContaining({
              id: 'assessment-1'
            }),
            expect.objectContaining({
              id: 'assessment-2'
            })
          ]
      })
    }) 
  })
})