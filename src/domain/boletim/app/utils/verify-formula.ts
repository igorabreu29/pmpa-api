import { calculatesAverageWithWeight } from "./calculates-average-with-weight.ts";
import { Status } from "./get-assessment-average-status.ts";
import { GenerateBehaviorStatus } from "./get-behavior-average-status.ts";
import { getGeralStudentAverageStatus } from "./get-geral-student-average-status.ts";

export interface AssessmentWithModule {
  vf: number;
  avi: number | null;
  avii: number | null;
  vfe?: number | null;
  average: number;
  status: Status;
  isRecovering: boolean;
  id: string;
  module: number;
}

interface FormulaProps {
  assessments: (AssessmentWithModule | null)[],
  behaviorAverage?: {
    behaviorAverageStatus: GenerateBehaviorStatus | GenerateBehaviorStatus[]
    behaviorsCount: number
  } 
}

interface BehaviorAveragePerPeriod {
  behaviorAverageStatus: GenerateBehaviorStatus[]
  behaviorsCount: number
}

interface BehaviorAveragePerModule {
  behaviorAverageStatus: GenerateBehaviorStatus
  behaviorsCount: number
}

export interface AssessmentsPerPeriod {
  [x: string]: AssessmentWithModule[]
}

export const formulas = {
  period({ assessments, behaviorAverage }: FormulaProps) {
    const assessmentsPerPeriod: AssessmentsPerPeriod = {}

    for(const assessment of assessments) {
      if (!assessment) continue

      if (!assessmentsPerPeriod[`module${assessment?.module}`]) {
        assessmentsPerPeriod[`module${assessment?.module}`] = []
      }

      assessmentsPerPeriod[`module${assessment?.module}`].push({
        ...assessment
      })
    }

    const { behaviorAverageStatus, behaviorsCount } = behaviorAverage as BehaviorAveragePerPeriod

    let weightPerPeriod = 0

    const averagesWithWeight = behaviorAverageStatus.map((item, index) => {
      const assessmentsAveragePerPeriod = assessmentsPerPeriod[`module${index + 1}`]?.reduce((previousAverage, currentAverage) => {
        return Number(previousAverage) + Number(currentAverage.average)
      }, 0)
      
      const periodAverageWithWeight = calculatesAverageWithWeight(
        { 
          assessmentAverage: assessmentsAveragePerPeriod,
          assessmentsQuantityPerPeriod: assessmentsPerPeriod[`module${index + 1}`]?.length, 
          behaviorAveragePerPeriod: item.behaviorAverage, 
          weight: weightPerPeriod || 1 
        })
        
      if (periodAverageWithWeight && index === 2) weightPerPeriod += 2
      if (periodAverageWithWeight && index !== 2) weightPerPeriod += 1

      return periodAverageWithWeight
    })

    const studentIsRecovering = assessments.some((item) => item?.isRecovering)
    const geralAverage = averagesWithWeight.reduce((previousModuleAverage, currentModuleAverage) => previousModuleAverage + currentModuleAverage, 0) / weightPerPeriod

    const status = getGeralStudentAverageStatus({ average: geralAverage, isRecovering: studentIsRecovering })

    return {
      averageInform: {
        geralAverage: Number(geralAverage.toFixed(3)), 
        behaviorAverageStatus,
        behaviorsCount,
        status
      },
      assessments: {
        ...assessmentsPerPeriod
      },
      assessmentsCount: assessments.length,
    }
  },

  module({ assessments, behaviorAverage }: FormulaProps) {
    const studentIsRecovering = assessments.some((item) => item?.isRecovering)
    
    const assessmentsAverage = assessments.reduce((previousAverageAssessment, currentAverageAssessment) => {
      return previousAverageAssessment + Number(currentAverageAssessment?.average)
    }, 0) / assessments.length

    
    let assessmentsAverageWithBehaviorAverage: number = 0
    if (behaviorAverage) {
      const { behaviorAverageStatus } = behaviorAverage as BehaviorAveragePerModule
      assessmentsAverageWithBehaviorAverage = (assessmentsAverage + behaviorAverageStatus.behaviorAverage) / 2
    }

    const status = getGeralStudentAverageStatus({ average: assessmentsAverageWithBehaviorAverage || assessmentsAverage, isRecovering: studentIsRecovering })

    return {
      averageInform: {
        geralAverage: behaviorAverage ? Number(assessmentsAverageWithBehaviorAverage.toFixed(3)) : Number(assessmentsAverage.toFixed(3)),
        behaviorAverageStatus: behaviorAverage ? behaviorAverage.behaviorAverageStatus : [],
        behaviorsCount: behaviorAverage ? behaviorAverage.behaviorsCount : 0,
        status
      },
      assessments,
      assessmentsCount: assessments.length,
    }
  }
}