export interface UserInfo {
  name: string
  phone: string
  age: number
  gender: 'male' | 'female'
  appointmentCode?: string
}

export interface ConsultationData {
  basicInfo: {
    name: string
    phone: string
    age: string
    gender: string
  }
  concerns: string[]
  budget: string
  improvements: string[]
  riskFlags: string[]
  isPregnant: boolean
  isBreastfeeding: boolean
  hasAllergy: boolean
  uploadFiles: string[]
}

export interface QueueInfo {
  queueNumber: string
  waitTime: number
  consultantName: string
  consultantAvatar: string
  roomNumber: string
  floor: string
  status: 'waiting' | 'called' | 'consulting' | 'done'
  needNurseReview: boolean
  estimatedTime: string
}

export interface OptionItem {
  id: string
  label: string
  icon?: string
  description?: string
}

export interface StepItem {
  id: number
  title: string
  status: 'pending' | 'current' | 'completed'
}
