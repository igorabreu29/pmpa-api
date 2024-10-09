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
    behaviorAverageStatus: GenerateBehaviorStatus[]
    behaviorsCount: number
  } 
}

interface FormulaSubProps {
  assessments: (AssessmentWithModule | null)[],
  behaviorAverage?: {
    behaviorAverageStatus: GenerateBehaviorStatus[]
    behaviorsCount: number
  } 
  disciplineModule: number
}

interface BehaviorAveragePerPeriod {
  behaviorAverageStatus: GenerateBehaviorStatus[]
  behaviorsCount: number
}

interface BehaviorAveragePerModule {
  behaviorAverageStatus: GenerateBehaviorStatus[]
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
    
    if (behaviorAverage && behaviorAverage.behaviorAverageStatus.length) {
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

    let generalAverage: number | null = 0

    if (assessmentsPerPeriod['module4']) {
      const assessmentsAverageModule1 = assessmentsPerPeriod['module1'] && assessmentsPerPeriod['module1']?.reduce((previousAverage, currentAverage) => {
        return Number(previousAverage) + Number(currentAverage.average)
      }, 0) || 0
      
      const assessmentAverageModule1Period = calculatesAverageWithWeight({
        assessmentAverage: assessmentsAverageModule1,
        assessmentsQuantityPerPeriod: assessmentsPerPeriod['module1']?.length, 
        behaviorAveragePerPeriod: null, 
        weight: 1
      }) || 0

      const assessmentsAverageModule2 = assessmentsPerPeriod['module2'] && assessmentsPerPeriod['module2']?.reduce((previousAverage, currentAverage) => {
        return Number(previousAverage) + Number(currentAverage.average)
      }, 0) || 0

      const assessmentAverageModule2Period = calculatesAverageWithWeight({
        assessmentAverage: assessmentsAverageModule2,
        assessmentsQuantityPerPeriod: assessmentsPerPeriod['module2']?.length, 
        behaviorAveragePerPeriod: null, 
        weight: 1
      }) || 0
      
      const assessmentsAverageModule3 = assessmentsPerPeriod['module3'] && assessmentsPerPeriod['module3']?.reduce((previousAverage, currentAverage) => {
        return Number(previousAverage) + Number(currentAverage.average)
      }, 0) || 0

      const assessmentAverageModule3Period = calculatesAverageWithWeight({
        assessmentAverage: assessmentsAverageModule3,
        assessmentsQuantityPerPeriod: assessmentsPerPeriod['module3']?.length, 
        behaviorAveragePerPeriod: null, 
        weight: 2
      }) || 0

      const tcc = assessmentsPerPeriod['module4'][0].average

      generalAverage = (assessmentAverageModule1Period + assessmentAverageModule2Period + assessmentAverageModule3Period * 2 + tcc * 2) / 6
    }

    if (!assessmentsPerPeriod['module4']) {
      const assessmentsAverageModule1 = assessmentsPerPeriod['module1'] && assessmentsPerPeriod['module1']?.reduce((previousAverage, currentAverage) => {
        return Number(previousAverage) + Number(currentAverage.average)
      }, 0) || 0
      
      const assessmentAverageModule1Period = calculatesAverageWithWeight({
        assessmentAverage: assessmentsAverageModule1,
        assessmentsQuantityPerPeriod: assessmentsPerPeriod['module1']?.length, 
        behaviorAveragePerPeriod: null, 
        weight: 1
      }) || 0

      const assessmentsAverageModule2 = assessmentsPerPeriod['module2'] && assessmentsPerPeriod['module2']?.reduce((previousAverage, currentAverage) => {
        return Number(previousAverage) + Number(currentAverage.average)
      }, 0) || 0

      const assessmentAverageModule2Period = calculatesAverageWithWeight({
        assessmentAverage: assessmentsAverageModule2,
        assessmentsQuantityPerPeriod: assessmentsPerPeriod['module2']?.length, 
        behaviorAveragePerPeriod: null, 
        weight: 1
      }) || 0
      
      const assessmentsAverageModule3 = assessmentsPerPeriod['module3'] && assessmentsPerPeriod['module3']?.reduce((previousAverage, currentAverage) => {
        return Number(previousAverage) + Number(currentAverage.average)
      }, 0) || 0

      const assessmentAverageModule3Period = calculatesAverageWithWeight({
        assessmentAverage: assessmentsAverageModule3,
        assessmentsQuantityPerPeriod: assessmentsPerPeriod['module3']?.length, 
        behaviorAveragePerPeriod: null, 
        weight: 2
      }) || 0

      const average = (assessmentAverageModule1Period + assessmentAverageModule2Period + assessmentAverageModule3Period) / 4

      generalAverage = average
    }

    const isStudentRecovering = assessments.some((item) => item?.isRecovering)    
    const studentAverageStatus = getGeralStudentAverageStatus({ average: geralAverageWithBehavior || generalAverage, isRecovering: isStudentRecovering })

    const isStudentSecondSeason = assessments.some(assessment => assessment?.status === 'second season')

    studentAverageStatus.status = isStudentSecondSeason ? 'second season' : studentAverageStatus.status

    const assessmentTotalVF = assessments.filter(assessment => assessment?.vf !== null).length
    const assessmentTotalAVI = assessments.filter(assessment => assessment?.avi !== null).length
    const assessmentTotalAVII = assessments.filter(assessment => assessment?.avii !== null).length
    
    const assessmentsCount = 
      assessmentTotalVF + assessmentTotalAVI + assessmentTotalAVII
    
    const average = generalAverage ? Number(generalAverage.toFixed(3)) : 0

    return {
      averageInform: {
        geralAverage: geralAverageWithBehavior ? Number(geralAverageWithBehavior.toFixed(3)) : average, 
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

  sub({ assessments, behaviorAverage, disciplineModule }: FormulaSubProps) {
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

    let average: number = 0
    
    if (behaviorAverage) {
      const { behaviorAverageStatus } = behaviorAverage as BehaviorAveragePerPeriod

      if (disciplineModule === 1) {
        const assessmentsAveragePerPeriod = assessmentsPerPeriod[`module1`]?.reduce((previousAverage, currentAverage) => {
          return Number(previousAverage) + Number(currentAverage.average)
        }, 0)

        const periodAverageWithWeight = calculatesAverageWithWeight({ 
          assessmentAverage: assessmentsAveragePerPeriod,
          assessmentsQuantityPerPeriod: assessmentsPerPeriod[`module1`]?.length, 
          behaviorAveragePerPeriod: behaviorAverageStatus[0]?.behaviorAverage, 
          weight: 1 
        })

        average = periodAverageWithWeight
      }

      if (disciplineModule === 2) {
        const assessmentsAveragePerPeriod = assessmentsPerPeriod[`module2`]?.reduce((previousAverage, currentAverage) => {
          return Number(previousAverage) + Number(currentAverage.average)
        }, 0)

        const periodAverageWithWeight = calculatesAverageWithWeight({ 
          assessmentAverage: assessmentsAveragePerPeriod,
          assessmentsQuantityPerPeriod: assessmentsPerPeriod[`module2`]?.length, 
          behaviorAveragePerPeriod: behaviorAverageStatus[1]?.behaviorAverage, 
          weight: 1 
        })

        average = periodAverageWithWeight
      }

      if (disciplineModule === 3) {
        const assessmentsAveragePerPeriod = assessmentsPerPeriod[`module3`]?.reduce((previousAverage, currentAverage) => {
          return Number(previousAverage) + Number(currentAverage.average)
        }, 0)

        const periodAverageWithWeight = calculatesAverageWithWeight({ 
          assessmentAverage: assessmentsAveragePerPeriod,
          assessmentsQuantityPerPeriod: assessmentsPerPeriod[`module3`]?.length, 
          behaviorAveragePerPeriod: behaviorAverageStatus[2]?.behaviorAverage, 
          weight: 2
        })

        average = periodAverageWithWeight / 2
      }
    }

    if (!behaviorAverage) {
      if (disciplineModule === 1) {
        const assessmentsAveragePerPeriod = assessmentsPerPeriod[`module1`]?.reduce((previousAverage, currentAverage) => {
          return Number(previousAverage) + Number(currentAverage.average)
        }, 0)

        const periodAverageWithWeight = calculatesAverageWithWeight({ 
          assessmentAverage: assessmentsAveragePerPeriod,
          assessmentsQuantityPerPeriod: assessmentsPerPeriod[`module1`]?.length, 
          behaviorAveragePerPeriod: null, 
          weight: 1 
        })

        average = periodAverageWithWeight
      }

      if (disciplineModule === 2) {
        const assessmentsAveragePerPeriod = assessmentsPerPeriod[`module2`]?.reduce((previousAverage, currentAverage) => {
          return Number(previousAverage) + Number(currentAverage.average)
        }, 0)

        const periodAverageWithWeight = calculatesAverageWithWeight({ 
          assessmentAverage: assessmentsAveragePerPeriod,
          assessmentsQuantityPerPeriod: assessmentsPerPeriod[`module2`]?.length, 
          behaviorAveragePerPeriod: null, 
          weight: 1 
        })

        average = periodAverageWithWeight
      }

      if (disciplineModule === 3) {
        const assessmentsAveragePerPeriod = assessmentsPerPeriod[`module3`]?.reduce((previousAverage, currentAverage) => {
          return Number(previousAverage) + Number(currentAverage.average)
        }, 0)

        const periodAverageWithWeight = calculatesAverageWithWeight({ 
          assessmentAverage: assessmentsAveragePerPeriod,
          assessmentsQuantityPerPeriod: assessmentsPerPeriod[`module3`]?.length, 
          behaviorAveragePerPeriod: null, 
          weight: 2
        })

        average = periodAverageWithWeight / 2
      }
    }

    assessments = assessments.filter(assessment => assessment?.module === disciplineModule)

    const isStudentRecovering = assessments.some((item) => item?.isRecovering)    
    const studentAverageStatus = getGeralStudentAverageStatus({ average, isRecovering: isStudentRecovering })

    const isStudentSecondSeason = assessments.some(assessment => assessment?.status === 'second season')

    studentAverageStatus.status = isStudentSecondSeason ? 'second season' : studentAverageStatus.status

    const assessmentTotalVF = assessments.filter(assessment => assessment?.vf !== null).length
    const assessmentTotalAVI = assessments.filter(assessment => assessment?.avi !== null).length
    const assessmentTotalAVII = assessments.filter(assessment => assessment?.avii !== null).length
    
    const assessmentsCount = 
      assessmentTotalVF + assessmentTotalAVI + assessmentTotalAVII

    return {
      averageInform: {
        geralAverage: average ? Number(average.toFixed(3)) : 0, 
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
      behaviorAverageStatus.length ? averages.push(...behaviorAverageStatus.map(item => item.behaviorAverage)) : averages
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
        geralAverage: Number(assessmentsAverage.toFixed(3)),
        behaviorAverageStatus: behaviorAverage ? behaviorAverage.behaviorAverageStatus : [],
        behaviorsCount: behaviorAverage ? behaviorAverage.behaviorsCount : 0,
        studentAverageStatus
      },
      assessments,
      assessmentsCount,
    }
  }
}