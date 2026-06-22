import { create } from 'zustand'
import { ConsultationData, QueueInfo, UserInfo, QueueStatus, BoardCustomer, NavStepKey } from '@/types'

interface ConsultationState {
  currentStep: number
  totalSteps: number
  userInfo: UserInfo
  consultationData: ConsultationData
  queueInfo: QueueInfo | null
  privacyAgreed: boolean
  isCheckedIn: boolean
  boardCustomers: BoardCustomer[]

  setCurrentStep: (step: number) => void
  setUserInfo: (info: Partial<UserInfo>) => void
  setConsultationData: (data: Partial<ConsultationData>) => void
  setPrivacyAgreed: (agreed: boolean) => void
  setIsCheckedIn: (checked: boolean) => void
  setQueueInfo: (info: QueueInfo) => void
  updateQueueStatus: (status: QueueStatus, extra?: Partial<QueueInfo>) => void
  decrementAheadCount: () => void
  setNurseReviewResult: (
    result: 'pending' | 'approved' | 'postponed',
    note?: string,
    customerId?: string
  ) => void
  updateArriveProgress: (progress: NavStepKey) => void
  addBoardCustomer: (customer: BoardCustomer) => void
  updateBoardCustomerStatus: (id: string, status: QueueStatus, extra?: Partial<BoardCustomer>) => void
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

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  currentStep: 0,
  totalSteps: 6,
  userInfo: initialUserInfo,
  consultationData: initialConsultationData,
  queueInfo: null,
  privacyAgreed: false,
  isCheckedIn: false,
  boardCustomers: [],

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
    const updated = {
      queueInfo: {
        ...state.queueInfo,
        status,
        ...(extra || {})
      }
    }
    const qNum = state.queueInfo.queueNumber
    const bc = state.boardCustomers.find(c => c.queueNumber === qNum)
    if (bc) {
      return {
        ...updated,
        boardCustomers: state.boardCustomers.map(c =>
          c.queueNumber === qNum ? { ...c, status, ...(extra as Partial<BoardCustomer>) } : c
        )
      }
    }
    return updated
  }),
  decrementAheadCount: () => set((state) => {
    if (!state.queueInfo || state.queueInfo.aheadCount <= 0) return {}
    const newCount = state.queueInfo.aheadCount - 1
    return {
      queueInfo: {
        ...state.queueInfo,
        aheadCount: newCount,
        waitTime: Math.max(0, state.queueInfo.waitTime - 5)
      }
    }
  }),
  setNurseReviewResult: (result, note, customerId) => set((state) => {
    let newStatus: QueueStatus = state.queueInfo?.status || 'waiting'
    if (result === 'approved') {
      newStatus = 'waiting'
    } else if (result === 'postponed') {
      newStatus = 'nurse_rejected'
    } else if (result === 'pending') {
      newStatus = 'nurse_pending'
    }

    let updatedState: Partial<ConsultationState> = {}

    if (state.queueInfo) {
      updatedState.queueInfo = {
        ...state.queueInfo,
        status: newStatus,
        nurseReviewResult: result,
        nurseNote: note
      }
    }

    if (customerId || state.queueInfo) {
      const targetId = customerId
      updatedState.boardCustomers = state.boardCustomers.map(c => {
        const match = targetId ? c.id === targetId : state.queueInfo && c.queueNumber === state.queueInfo.queueNumber
        if (match) {
          return { ...c, status: newStatus, nurseNote: note }
        }
        return c
      })
    }

    return updatedState
  }),
  updateArriveProgress: (progress) => set((state) => {
    if (!state.queueInfo) return {}
    const progressMap: Record<NavStepKey, QueueInfo['arriveProgress']> = {
      elevator: 'at_elevator',
      floor: 'at_floor',
      room: 'at_room'
    }
    const qNum = state.queueInfo.queueNumber
    const newState = {
      queueInfo: {
        ...state.queueInfo,
        arriveProgress: progressMap[progress]
      }
    }
    return {
      ...newState,
      boardCustomers: state.boardCustomers.map(c =>
        c.queueNumber === qNum ? { ...c, status: state.queueInfo!.status } : c
      )
    }
  }),
  addBoardCustomer: (customer) => set((state) => {
    const exists = state.boardCustomers.some(c => c.queueNumber === customer.queueNumber)
    if (exists) return {}
    return { boardCustomers: [...state.boardCustomers, customer] }
  }),
  updateBoardCustomerStatus: (id, status, extra) => set((state) => ({
    boardCustomers: state.boardCustomers.map(c =>
      c.id === id ? { ...c, status, ...(extra || {}) } : c
    )
  })),
  resetAll: () => set({
    currentStep: 0,
    userInfo: initialUserInfo,
    consultationData: initialConsultationData,
    queueInfo: null,
    privacyAgreed: false,
    isCheckedIn: false
  })
}))
