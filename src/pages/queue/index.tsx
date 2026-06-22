import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useConsultationStore } from '@/store/consultation'
import { generateQueueInfo, consultants, generateMockBoardCustomers } from '@/data/mock'
import { QueueStatus } from '@/types'
import styles from './index.module.scss'
import classnames from 'classnames'

const statusDisplay: Record<QueueStatus, { label: string; icon: string }> = {
  nurse_pending: { label: '待护士复核', icon: '👩‍⚕️' },
  nurse_rejected: { label: '暂缓咨询', icon: '⚠️' },
  waiting: { label: '等待叫号', icon: '⏳' },
  almost: { label: '快到号了', icon: '🔔' },
  called: { label: '已叫号', icon: '📢' },
  consulting: { label: '面诊中', icon: '💬' },
  done: { label: '已完成', icon: '✅' }
}

const riskFlagLabels: Record<string, string> = {
  pregnant: '怀孕/备孕期',
  breastfeeding: '哺乳期',
  allergy: '过敏史',
  scar: '疤痕体质',
  disease: '慢性疾病',
  surgery: '半年内手术史'
}

const QueuePage: React.FC = () => {
  const {
    queueInfo,
    isCheckedIn,
    setQueueInfo,
    consultationData,
    setNurseReviewResult,
    updateQueueStatus,
    decrementAheadCount,
    addBoardCustomer,
    boardCustomers
  } = useConsultationStore()
  const [showNurseDebug, setShowNurseDebug] = useState(false)

  const hasRiskFlags = consultationData.riskFlags?.length > 0
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const decrementTimerRef = useRef<NodeJS.Timeout | null>(null)

  const consultant = queueInfo
    ? consultants.find(c => c.name === queueInfo.consultantName) || consultants[0]
    : consultants[0]

  useEffect(() => {
    if (boardCustomers.length === 0 && __DEV__) {
      generateMockBoardCustomers().forEach(c => addBoardCustomer(c))
    }
  }, [addBoardCustomer, boardCustomers.length])

  useEffect(() => {
    if (!queueInfo) return

    if (timerRef.current) clearTimeout(timerRef.current)
    if (decrementTimerRef.current) clearInterval(decrementTimerRef.current)

    if (queueInfo.status === 'waiting') {
      if (queueInfo.aheadCount > 2) {
        decrementTimerRef.current = setInterval(() => {
          decrementAheadCount()
        }, 10000)
      }

      if (queueInfo.aheadCount <= 2) {
        timerRef.current = setTimeout(() => {
          updateQueueStatus('almost', { aheadCount: Math.max(1, queueInfo.aheadCount - 1) })
          console.log('[Queue] 自动推进: waiting → almost')
        }, 8000)
      }
    }

    if (queueInfo.status === 'almost') {
      timerRef.current = setTimeout(() => {
        updateQueueStatus('called', { aheadCount: 0, waitTime: 0 })
        console.log('[Queue] 自动推进: almost → called')
        Taro.vibrateShort && Taro.vibrateShort({ type: 'medium' })
      }, 12000)
    }

    if (queueInfo.status === 'called') {
      timerRef.current = setTimeout(() => {
        if (queueInfo.arriveProgress === 'at_room') {
          updateQueueStatus('consulting')
          console.log('[Queue] 自动推进: called → consulting')
        }
      }, 18000)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (decrementTimerRef.current) clearInterval(decrementTimerRef.current)
    }
  }, [queueInfo?.status, queueInfo?.aheadCount, queueInfo?.arriveProgress, updateQueueStatus, decrementAheadCount])

  const handleCallConsultant = () => {
    Taro.showModal({
      title: '呼叫咨询师',
      content: `确认呼叫${consultant.name}？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已通知咨询师', icon: 'success' })
          console.log('[Queue] 已呼叫咨询师:', consultant.name)
        }
      }
    })
  }

  const handleNavigate = () => {
    Taro.navigateTo({
      url: '/pages/navigation/index'
    })
  }

  const handleCallNurse = () => {
    Taro.showToast({ title: '已通知护士前来', icon: 'success' })
    console.log('[Queue] 已请求护士复核')
  }

  const handleSimulateStatus = (status: QueueStatus) => {
    updateQueueStatus(status, {
      aheadCount: status === 'waiting' ? 5 : status === 'almost' ? 2 : 0,
      waitTime: status === 'waiting' ? 20 : status === 'almost' ? 5 : 0
    })
    console.log('[Queue] 模拟切换状态:', status)
  }

  const handleStartConsultation = () => {
    if (!isCheckedIn) {
      Taro.switchTab({ url: '/pages/index/index' })
      return
    }
    Taro.navigateTo({ url: '/pages/privacy/index' })
  }

  const handleGetQueue = () => {
    const queueData = generateQueueInfo(hasRiskFlags)
    setQueueInfo(queueData)
    console.log('[Queue] 获取排队信息:', queueData)
  }

  const handleNurseApprove = () => {
    setNurseReviewResult('approved')
    console.log('[Queue] 护士复核通过，进入候诊')
    Taro.showToast({ title: '复核通过', icon: 'success' })
  }

  const handleNursePostpone = () => {
    setNurseReviewResult(
      'postponed',
      '建议先调理身体状况，2周后再来咨询'
    )
    console.log('[Queue] 护士建议暂缓咨询')
    Taro.showToast({ title: '已记录', icon: 'none' })
  }

  const handleOpenBoard = () => {
    Taro.navigateTo({ url: '/pages/board/index' })
  }

  const handleOpenNurseStation = () => {
    Taro.navigateTo({ url: '/pages/nurse/index' })
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
        {__DEV__ && (
          <View className={styles.devEntryBar}>
            <View className={styles.devEntryBtn} onClick={handleOpenBoard}>
              <Text className={styles.devEntryIcon}>📊</Text>
              <Text className={styles.devEntryText}>导诊看板</Text>
            </View>
            <View className={styles.devEntryBtn} onClick={handleOpenNurseStation}>
              <Text className={styles.devEntryIcon}>👩‍⚕️</Text>
              <Text className={styles.devEntryText}>护士工作站</Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  const isNursePending = queueInfo.status === 'nurse_pending'
  const isNurseRejected = queueInfo.status === 'nurse_rejected'
  const isCalled = queueInfo.status === 'called'
  const isAlmost = queueInfo.status === 'almost'
  const isConsulting = queueInfo.status === 'consulting'
  const showNavigationCard = !isNursePending && !isNurseRejected

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>候诊进度</Text>
        <Text className={styles.subtitle}>
          {queueInfo.status === 'nurse_pending' && '请稍候，护士正在赶来'}
          {queueInfo.status === 'nurse_rejected' && '护士建议暂缓'}
          {queueInfo.status === 'called' && '请尽快前往诊室'}
          {queueInfo.status === 'almost' && `预计 ${queueInfo.estimatedTime} 轮到您`}
          {queueInfo.status === 'waiting' && `预计 ${queueInfo.estimatedTime} 轮到您`}
          {queueInfo.status === 'consulting' && '正在面诊中'}
        </Text>
      </View>

      {isNursePending && (
        <View className={styles.nursePendingCard}>
          <Text className={styles.icon}>👩‍⚕️</Text>
          <Text className={styles.title}>等待护士复核</Text>
          <Text className={styles.desc}>
            根据您填写的健康信息，需要护士先与您当面确认。请在座位上稍候，护士会很快过来与您沟通。
          </Text>
          {hasRiskFlags && (
            <View className={styles.riskList}>
              <Text className={styles.riskTitle}>需要复核的事项：</Text>
              {consultationData.riskFlags.map(flag => (
                <Text key={flag} className={styles.riskItem}>
                  • {riskFlagLabels[flag] || flag}
                </Text>
              ))}
            </View>
          )}
          <View className={styles.actions}>
            <Button className={classnames(styles.actionBtn, styles.call)} onClick={handleCallNurse}>
              <Text>🔔</Text>
              <Text className={styles.actionText}>呼叫护士</Text>
            </Button>
            {__DEV__ && (
              <Button className={classnames(styles.actionBtn, styles.test)} onClick={() => setShowNurseDebug(!showNurseDebug)}>
                <Text>🧪</Text>
                <Text className={styles.actionText}>模拟处理</Text>
              </Button>
            )}
          </View>
          {__DEV__ && showNurseDebug && (
            <View style={{ marginTop: '24rpx', display: 'flex', gap: '16rpx', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                style={{
                  height: '56rpx',
                  padding: '0 24rpx',
                  background: '#fff',
                  border: '2rpx solid #FFD699',
                  borderRadius: '28rpx',
                  fontSize: '22rpx',
                  color: '#D48806'
                }}
                onClick={handleNurseApprove}
              >
                护士已通过
              </Button>
              <Button
                style={{
                  height: '56rpx',
                  padding: '0 24rpx',
                  background: '#FFF0F0',
                  border: '2rpx solid #FFCCCC',
                  borderRadius: '28rpx',
                  fontSize: '22rpx',
                  color: '#CF1322'
                }}
                onClick={handleNursePostpone}
              >
                暂缓咨询
              </Button>
            </View>
          )}
        </View>
      )}

      {isNurseRejected && (
        <View className={styles.postponedCard}>
          <Text className={styles.icon}>⚠️</Text>
          <Text className={styles.title}>护士建议暂缓本次咨询</Text>
          <Text className={styles.desc}>
            为了您的安全和健康，护士复核后建议您暂缓本次医美咨询。
          </Text>
          {queueInfo.nurseNote && (
            <Text className={styles.note}>护士备注：{queueInfo.nurseNote}</Text>
          )}
        </View>
      )}

      {isCalled && (
        <View className={styles.calledBanner}>
          <Text className={styles.icon}>📢</Text>
          <Text className={styles.title}>叫号提醒：{queueInfo.queueNumber}</Text>
          <Text className={styles.desc}>
            现在轮到您了！请前往{queueInfo.floor}{queueInfo.roomNumber}，{consultant.name}正在等您
          </Text>
          <Button className={styles.goNavBtn} onClick={handleNavigate}>
            <Text>🧭</Text>
            <Text className={styles.goNavText}>立即查看路线</Text>
          </Button>
        </View>
      )}

      {isAlmost && (
        <View className={styles.almostBanner}>
          <Text className={styles.icon}>🔔</Text>
          <View className={styles.text}>
            <Text className={styles.title}>快到号了，请做好准备</Text>
            <Text className={styles.desc}>您前面还有 {queueInfo.aheadCount} 位，约 {queueInfo.waitTime} 分钟后轮到您</Text>
          </View>
        </View>
      )}

      {isConsulting && (
        <View className={styles.consultingBanner}>
          <Text className={styles.icon}>💬</Text>
          <Text className={styles.title}>正在面诊中</Text>
          <Text className={styles.desc}>请在{queueInfo.roomNumber}内与{consultant.name}沟通</Text>
        </View>
      )}

      {!isNursePending && !isNurseRejected && (
        <View className={styles.queueCard}>
          <Text className={styles.queueNumberLabel}>您的候诊号码</Text>
          <Text className={styles.queueNumber}>{queueInfo.queueNumber}</Text>
          <View className={classnames(styles.queueStatus, styles[queueInfo.status])}>
            <Text className={styles.statusDot}></Text>
            <Text className={styles.statusText}>
              {statusDisplay[queueInfo.status]?.icon} {statusDisplay[queueInfo.status]?.label}
            </Text>
          </View>

          <View className={styles.waitInfo}>
            <View className={styles.waitItem}>
              <Text className={styles.waitValue}>{queueInfo.waitTime}</Text>
              <Text className={styles.waitLabel}>预计等待(分钟)</Text>
            </View>
            <View className={classnames(styles.waitItem, { [styles.highlight]: queueInfo.aheadCount <= 2 })}>
              <Text className={styles.waitValue}>{queueInfo.aheadCount}</Text>
              <Text className={styles.waitLabel}>您前面还有(人)</Text>
            </View>
            <View className={styles.waitItem}>
              <Text className={styles.waitValue}>{queueInfo.floor}</Text>
              <Text className={styles.waitLabel}>所在楼层</Text>
            </View>
          </View>
          {queueInfo.arriveProgress && queueInfo.arriveProgress !== 'not_started' && (
            <View className={styles.arriveHint}>
              <Text className={styles.arriveHintIcon}>🚶</Text>
              <Text className={styles.arriveHintText}>
                {queueInfo.arriveProgress === 'at_elevator' && '您已到达电梯口'}
                {queueInfo.arriveProgress === 'at_floor' && `您已到达${queueInfo.floor}`}
                {queueInfo.arriveProgress === 'at_room' && '您已到达诊室门口，咨询师很快会请您进入'}
              </Text>
            </View>
          )}
        </View>
      )}

      {!isNursePending && !isNurseRejected && (
        <View className={styles.consultantCard}>
          <Image className={styles.avatar} src={consultant.avatar} mode="aspectFill" />
          <View className={styles.consultantInfo}>
            <Text className={styles.consultantName}>{consultant.name}</Text>
            <Text className={styles.consultantTitle}>{consultant.title}</Text>
            <Text className={styles.consultantSpecialty}>擅长：{consultant.specialty}</Text>
          </View>
          {!isConsulting && (
            <Button className={styles.callButton} onClick={handleCallConsultant}>
              <Text>📞</Text>
              <Text className={styles.callButtonText}>呼叫</Text>
            </Button>
          )}
        </View>
      )}

      {showNavigationCard && (
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
          <Button
            className={classnames(styles.navButton, { [styles.urgent]: isCalled })}
            onClick={handleNavigate}
          >
            <Text>🧭</Text>
            <Text className={styles.navButtonText}>
              {isCalled ? '立即前往诊室' : '查看路线导航'}
            </Text>
          </Button>
        </View>
      )}

      {__DEV__ && (
        <View
          style={{
            background: '#f5f5f5',
            borderRadius: '16rpx',
            padding: '24rpx',
            marginBottom: '100rpx'
          }}
        >
          <Text
            style={{
              display: 'block',
              marginBottom: '16rpx',
              fontSize: '24rpx',
              color: '#999',
              fontWeight: 500
            }}
          >
            🔧 开发环境调试入口
          </Text>
          {queueInfo && (
            <>
              <Text style={{ fontSize: '22rpx', color: '#888', marginBottom: '12rpx', display: 'block' }}>
                状态模拟：
              </Text>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx', marginBottom: '16rpx' }}>
                {(['waiting', 'almost', 'called', 'consulting', 'done'] as QueueStatus[]).map(s => (
                  <Button
                    key={s}
                    style={{
                      height: '56rpx',
                      padding: '0 20rpx',
                      background: queueInfo.status === s ? '#FF6B9D' : '#fff',
                      border: `2rpx solid ${queueInfo.status === s ? '#FF6B9D' : '#ddd'}`,
                      borderRadius: '28rpx',
                      fontSize: '22rpx',
                      color: queueInfo.status === s ? '#fff' : '#666'
                    }}
                    onClick={() => handleSimulateStatus(s)}
                  >
                    {statusDisplay[s]?.label}
                  </Button>
                ))}
              </View>
              <Button
                style={{
                  height: '56rpx',
                  padding: '0 24rpx',
                  background: '#fff',
                  border: '2rpx solid #FFB6C1',
                  borderRadius: '28rpx',
                  fontSize: '22rpx',
                  color: '#FF6B9D'
                }}
                onClick={handleGetQueue}
              >
                🔄 重新获取新号
              </Button>
            </>
          )}
          <View style={{ display: 'flex', gap: '12rpx', marginTop: '16rpx' }}>
            <Button
              style={{
                flex: 1,
                height: '64rpx',
                background: '#E6F4FF',
                border: '2rpx solid #91CAFF',
                borderRadius: '32rpx',
                fontSize: '24rpx',
                color: '#1677FF'
              }}
              onClick={handleOpenBoard}
            >
              📊 打开导诊看板
            </Button>
            <Button
              style={{
                flex: 1,
                height: '64rpx',
                background: '#FFF7E6',
                border: '2rpx solid #FFD591',
                borderRadius: '32rpx',
                fontSize: '24rpx',
                color: '#D48806'
              }}
              onClick={handleOpenNurseStation}
            >
              �‍⚕️ 打开护士工作站
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

export default QueuePage
