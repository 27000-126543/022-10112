import { create } from 'zustand'
import { ConsultationData, QueueInfo, UserInfo } from '@/types'

interface ConsultationState {
  currentStep: number
  totalSteps: number
  userInfo: UserInfo
  consultationData: ConsultationData
  queueInfo: QueueInfo | null
  privacyAgreed: boolean
  isCheckedIn: boolean

  setCurrentStep: (step: number) => void
  setUserInfo: (info: Partial<UserInfo>) => void
  setConsultationData: (data: Partial<ConsultationData>) => void
  setPrivacyAgreed: (agreed: boolean) => void
  setIsCheckedIn: (checked: boolean) => void
  setQueueInfo: (info: QueueInfo) => void
  resetAll: () => void
}

const initialConsultationData: ConsultationData = {
  basicInfo: {
    name: '',
    phone: '',
    age: '',
    gender: ''
  },
  concerns: [],
  budget: '',
  improvements: [],
  riskFlags: [],
  isPregnant: false,
  isBreastfeeding: false,
  hasAllergy: false,
  uploadFiles: []
}

const initialUserInfo: UserInfo = {
  name: '',
  phone: '',
  age: 0,
  gender: 'female'
}

export const useConsultationStore = create<ConsultationState>((set) => ({
  currentStep: 0,
  totalSteps: 6,
  userInfo: initialUserInfo,
  consultationData: initialConsultationData,
  queueInfo: null,
  privacyAgreed: false,
  isCheckedIn: false,

  setCurrentStep: (step) => set({ currentStep: step }),
  setUserInfo: (info) => set((state) => ({
    userInfo: { ...state.userInfo, ...info }
  })),
  setConsultationData: (data) => set((state) => ({
    consultationData: { ...state.consultationData, ...data }
  })),
  setPrivacyAgreed: (agreed) => set({ privacyAgreed: agreed }),
  setIsCheckedIn: (checked) => set({ isCheckedIn: checked }),
  setQueueInfo: (info) => set({ queueInfo: info }),
  resetAll: () => set({
    currentStep: 0,
    userInfo: initialUserInfo,
    consultationData: initialConsultationData,
    queueInfo: null,
    privacyAgreed: false,
    isCheckedIn: false
  })
}))
