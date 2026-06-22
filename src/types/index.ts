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

export type QueueStatus =
  | 'nurse_pending'
  | 'nurse_rejected'
  | 'waiting'
  | 'almost'
  | 'called'
  | 'consulting'
  | 'done'

export interface QueueInfo {
  queueNumber: string
  waitTime: number
  aheadCount: number
  consultantName: string
  consultantAvatar: string
  roomNumber: string
  floor: string
  status: QueueStatus
  needNurseReview: boolean
  estimatedTime: string
  nurseReviewResult?: 'pending' | 'approved' | 'postponed'
  nurseNote?: string
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

export interface MapPoint {
  id: string
  label: string
  type: 'current' | 'target' | 'elevator' | 'stairs' | 'room' | 'lobby'
  x: number
  y: number
}

export interface FloorMap {
  floor: string
  points: MapPoint[]
}
