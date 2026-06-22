import { create } from 'zustand'
import { ConsultationData, QueueInfo, UserInfo, QueueStatus } from '@/types'

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
  updateQueueStatus: (status: QueueStatus, extra?: Partial<QueueInfo>) => void
  setNurseReviewResult: (
    result: 'pending' | 'approved' | 'postponed',
    note?: string
  ) => void
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
  updateQueueStatus: (status, extra) => set((state) => {
    if (!state.queueInfo) return {}
    return {
      queueInfo: {
        ...state.queueInfo,
        status,
        ...(extra || {})
      }
    }
  }),
  setNurseReviewResult: (result, note) => set((state) => {
    if (!state.queueInfo) return {}
    let newStatus: QueueStatus = state.queueInfo.status
    if (result === 'approved') {
      newStatus = 'waiting'
    } else if (result === 'postponed') {
      newStatus = 'nurse_rejected'
    } else if (result === 'pending') {
      newStatus = 'nurse_pending'
    }
    return {
      queueInfo: {
        ...state.queueInfo,
        status: newStatus,
        nurseReviewResult: result,
        nurseNote: note
      }
    }
  }),
  resetAll: () => set({
    currentStep: 0,
    userInfo: initialUserInfo,
    consultationData: initialConsultationData,
    queueInfo: null,
    privacyAgreed: false,
    isCheckedIn: false
  })
}))
