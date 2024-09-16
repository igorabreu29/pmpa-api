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

      if (!assessmentsPerPeriod[`module${assessment.module}`]) {
        assessmentsPerPeriod[`module${assessment.module}`] = []
      }

      assessmentsPerPeriod[`module${assessment.module}`].push({
        ...assessment
      })
    }

    let geralAverageWithBehavior: number | null = null
    
    if (behaviorAverage) {
      const { behaviorAverageStatus } = behaviorAverage as BehaviorAveragePerPeriod
      
      let weightPerPeriod = 0
      const averagesWithWeight = behaviorAverageStatus.map((item, index) => {
        const assessmentsAveragePerPeriod = assessmentsPerPeriod[`module${index + 1}`]?.reduce((previousAverage, currentAverage) => {
          return Number(previousAverage) + Number(currentAverage.average)
        }, 0)
        
        const periodAverageWithWeight = calculatesAverageWithWeight({ 
            assessmentAverage: assessmentsAveragePerPeriod,
            assessmentsQuantityPerPeriod: assessmentsPerPeriod[`module${index + 1}`]?.length, 
            behaviorAveragePerPeriod: item.behaviorAverage, 
            weight: weightPerPeriod || 1 
          })
          
        if (periodAverageWithWeight && index === 2) weightPerPeriod += 2
        if (periodAverageWithWeight && index !== 2) weightPerPeriod += 1
  
        return periodAverageWithWeight
      })
  
      geralAverageWithBehavior = averagesWithWeight.reduce((previousModuleAverage, currentModuleAverage) => previousModuleAverage + currentModuleAverage, 0) / weightPerPeriod
    }

    let weightPerPeriod = 0
    let geralAverage: number = 0

    for (let i = 1; i <= 3; i++) {
      const assessmentsAveragePerPeriod = assessmentsPerPeriod[`module${i}`]?.reduce((previousAverage, currentAverage) => {
        return Number(previousAverage) + Number(currentAverage.average)
      }, 0)
      
      const periodAverageWithWeight = calculatesAverageWithWeight({ 
          assessmentAverage: assessmentsAveragePerPeriod,
          assessmentsQuantityPerPeriod: assessmentsPerPeriod[`module${i}`]?.length, 
          behaviorAveragePerPeriod: 0, 
          weight: weightPerPeriod || 1 
        })
        
      if (periodAverageWithWeight && i === 3) weightPerPeriod += 2
      if (periodAverageWithWeight && i !== 3) weightPerPeriod += 1

      geralAverage += periodAverageWithWeight
    }

    const geralAverageWithWeight = geralAverage / weightPerPeriod

    const isStudentRecovering = assessments.some((item) => item?.isRecovering)    
    const studentAverageStatus = getGeralStudentAverageStatus({ average: geralAverageWithBehavior || geralAverageWithWeight, isRecovering: isStudentRecovering })

    const isStudentSecondSeason = assessments.some(assessment => assessment?.status === 'second season')

    studentAverageStatus.status = isStudentSecondSeason ? 'second season' : studentAverageStatus.status

    const assessmentTotalVF = assessments.filter(assessment => assessment?.vf !== null).length
    const assessmentTotalAVI = assessments.filter(assessment => assessment?.avi !== null).length
    const assessmentTotalAVII = assessments.filter(assessment => assessment?.avii !== null).length
    
    const assessmentsCount = 
      assessmentTotalVF + assessmentTotalAVI + assessmentTotalAVII

    return {
      averageInform: {
        geralAverage: geralAverageWithBehavior ? Number(geralAverageWithBehavior.toFixed(3)) : Number(geralAverageWithWeight.toFixed(3)), 
        behaviorAverageStatus: behaviorAverage ? behaviorAverage.behaviorAverageStatus : [],
        behaviorsCount: behaviorAverage ? behaviorAverage.behaviorsCount : 0,
        studentAverageStatus
      },
      
      assessmentsPerPeriod: {
        ...assessmentsPerPeriod
      },

      assessments,
      assessmentsCount,
    }
  },

  module({ assessments, behaviorAverage }: FormulaProps) {
    const studentIsRecovering = assessments.some((item) => item?.isRecovering)

    const averages = assessments.map(item => item?.average)
    if (behaviorAverage) {
      const { behaviorAverageStatus } = behaviorAverage as BehaviorAveragePerModule
      behaviorAverageStatus.behaviorAverage ? averages.push(behaviorAverageStatus.behaviorAverage) : averages
    }

    const assessmentsAverage = Number(averages.reduce((previousAverageAssessment, currentAverageAssessment) => {
      return Number(previousAverageAssessment) + Number(currentAverageAssessment)
    }, 0)) / averages.length

    const studentAverageStatus = getGeralStudentAverageStatus({ average: assessmentsAverage || assessmentsAverage, isRecovering: studentIsRecovering })
    const isStudentSecondSeason = assessments.some(assessment => assessment?.status === 'second season')

    studentAverageStatus.status = isStudentSecondSeason ? 'second season' : studentAverageStatus.status

    const assessmentTotalVF = assessments.filter(assessment => assessment?.vf !== null).length
    const assessmentTotalAVI = assessments.filter(assessment => assessment?.avi !== null).length
    const assessmentTotalAVII = assessments.filter(assessment => assessment?.avii !== null).length
    
    const assessmentsCount = 
      assessmentTotalVF + assessmentTotalAVI + assessmentTotalAVII

    return {
      averageInform: {
        geralAverage: behaviorAverage ? Number(assessmentsAverage.toFixed(3)) : Number(assessmentsAverage.toFixed(3)),
        behaviorAverageStatus: behaviorAverage ? behaviorAverage.behaviorAverageStatus : [],
        behaviorsCount: behaviorAverage ? behaviorAverage.behaviorsCount : 0,
        studentAverageStatus
      },
      assessments,
      assessmentsCount,
    }
  }
}