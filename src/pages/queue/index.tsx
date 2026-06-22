import React from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useConsultationStore } from '@/store/consultation'
import { mockQueueInfo, consultants } from '@/data/mock'
import styles from './index.module.scss'
import classnames from 'classnames'

const QueuePage: React.FC = () => {
  const { queueInfo, isCheckedIn, setQueueInfo, consultationData } = useConsultationStore()

  const hasRiskFlags = consultationData.riskFlags?.length > 0 ||
    consultationData.isPregnant ||
    consultationData.isBreastfeeding

  const handleGetQueue = () => {
    const queueData = {
      ...mockQueueInfo,
      needNurseReview: hasRiskFlags
    }
    setQueueInfo(queueData)
    console.log('[Queue] 获取排队信息:', queueData)
  }

  const handleCallConsultant = () => {
    Taro.showModal({
      title: '呼叫咨询师',
      content: '确认呼叫您的专属咨询师？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已通知咨询师', icon: 'success' })
          console.log('[Queue] 已呼叫咨询师')
        }
      }
    })
  }

  const handleNavigate = () => {
    Taro.navigateTo({
      url: '/pages/navigation/index'
    })
  }

  const handleNurseReview = () => {
    Taro.showToast({ title: '已通知护士前来', icon: 'success' })
    console.log('[Queue] 已请求护士复核')
  }

  const handleStartConsultation = () => {
    if (!isCheckedIn) {
      Taro.switchTab({
        url: '/pages/index/index'
      })
      return
    }
    Taro.navigateTo({
      url: '/pages/privacy/index'
    })
  }

  if (!queueInfo) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>⏳</Text>
          <Text className={styles.emptyTitle}>暂无排队信息</Text>
          <Text className={styles.emptyDesc}>
            {isCheckedIn ? '完成导诊问卷后即可获取排队号码' : '请先完成到院签到'}
          </Text>
          <View className={styles.startButton} onClick={handleStartConsultation}>
            <Text className={styles.startButtonText}>
              {isCheckedIn ? '开始导诊' : '去签到'}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  const consultant = consultants.find(c => c.name === queueInfo.consultantName) || consultants[0]

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>候诊进度</Text>
        <Text className={styles.subtitle}>预计 {queueInfo.estimatedTime} 轮到您</Text>
      </View>

      {queueInfo.needNurseReview && (
        <View className={styles.riskWarning}>
          <View className={styles.riskHeader}>
            <Text className={styles.riskIcon}>⚠️</Text>
            <Text className={styles.riskTitle}>护士复核提醒</Text>
          </View>
          <Text className={styles.riskDesc}>
            根据您填写的信息，有部分情况需要护士先进行复核，请稍候，护士会很快前来与您确认。
          </Text>
          <Button className={styles.riskButton} onClick={handleNurseReview}>
            <Text className={styles.riskButtonText}>呼叫护士</Text>
          </Button>
        </View>
      )}

      <View className={styles.queueCard}>
        <Text className={styles.queueNumberLabel}>您的候诊号码</Text>
        <Text className={styles.queueNumber}>{queueInfo.queueNumber}</Text>
        <View className={classnames(styles.queueStatus, styles[queueInfo.status])}>
          <Text className={styles.statusText}>
            {queueInfo.status === 'waiting' && '等待叫号'}
            {queueInfo.status === 'called' && '已叫号，请到诊室'}
            {queueInfo.status === 'consulting' && '正在面诊'}
            {queueInfo.status === 'done' && '已完成'}
          </Text>
        </View>

        <View className={styles.waitInfo}>
          <View className={styles.waitItem}>
            <Text className={styles.waitValue}>{queueInfo.waitTime}</Text>
            <Text className={styles.waitLabel}>预计等待(分钟)</Text>
          </View>
          <View className={styles.waitItem}>
            <Text className={styles.waitValue}>5</Text>
            <Text className={styles.waitLabel}>您前面还有(人)</Text>
          </View>
          <View className={styles.waitItem}>
            <Text className={styles.waitValue}>{queueInfo.floor}</Text>
            <Text className={styles.waitLabel}>所在楼层</Text>
          </View>
        </View>
      </View>

      <View className={styles.consultantCard}>
        <Image
          className={styles.avatar}
          src={consultant.avatar}
          mode="aspectFill"
        />
        <View className={styles.consultantInfo}>
          <Text className={styles.consultantName}>{consultant.name}</Text>
          <Text className={styles.consultantTitle}>{consultant.title}</Text>
          <Text className={styles.consultantSpecialty}>擅长：{consultant.specialty}</Text>
        </View>
        <Button className={styles.callButton} onClick={handleCallConsultant}>
          <Text>📞</Text>
          <Text className={styles.callButtonText}>呼叫</Text>
        </Button>
      </View>

      <View className={styles.roomCard}>
        <View className={styles.roomHeader}>
          <Text className={styles.roomIcon}>🏥</Text>
          <Text className={styles.roomTitle}>诊室位置</Text>
        </View>
        <View className={styles.roomInfo}>
          <View>
            <Text className={styles.roomNumber}>{queueInfo.roomNumber}</Text>
            <Text className={styles.roomFloor}>{queueInfo.floor} · 请按指示牌前往</Text>
          </View>
        </View>
        <Button className={styles.navButton} onClick={handleNavigate}>
          <Text>🧭</Text>
          <Text className={styles.navButtonText}>查看路线导航</Text>
        </Button>
      </View>
    </View>
  )
}

export default QueuePage
