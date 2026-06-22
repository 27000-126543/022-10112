import React, { useState, useMemo } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useConsultationStore } from '@/store/consultation'
import { navigationFloors, consultants, getFloorMap } from '@/data/mock'
import { MapPoint, NavStep, NavStepKey } from '@/types'
import styles from './index.module.scss'
import classnames from 'classnames'

const NavigationPage: React.FC = () => {
  const { queueInfo, updateArriveProgress } = useConsultationStore()
  const [viewFloor, setViewFloor] = useState<string>('')
  const [showGuide, setShowGuide] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<NavStepKey[]>([])
  const [currentStep, setCurrentStep] = useState<NavStepKey | null>(null)

  const targetRoom = queueInfo?.roomNumber || '305诊室'
  const targetFloor = queueInfo?.floor || '3楼'
  const consultantName = queueInfo?.consultantName || '李医生'
  const estimatedTime = queueInfo?.estimatedTime || '--:--'
  const floorNum = parseInt(targetFloor) || 3

  const consultant = consultants.find(c => c.name === consultantName) || consultants[0]

  const displayFloor = viewFloor || targetFloor
  const floorMap = useMemo(() => getFloorMap(displayFloor, targetRoom), [displayFloor, targetRoom])

  const navSteps: NavStep[] = useMemo(() => {
    const steps: NavStep[] = []
    if (floorNum !== 1) {
      steps.push({
        key: 'elevator',
        title: '到达电梯口',
        description: '请找到大厅左侧的电梯，按下上行按钮等候',
        icon: '🛗'
      })
    }
    steps.push({
      key: 'floor',
      title: `到达${targetFloor}`,
      description: `出电梯后注意楼层指示牌，确认在${targetFloor}`,
      icon: '🏢'
    })
    steps.push({
      key: 'room',
      title: `到达${targetRoom}门口`,
      description: '请轻轻敲门，咨询师会请您进入',
      icon: '🚪'
    })
    return steps
  }, [floorNum, targetFloor, targetRoom])

  const handleCallConsultant = () => {
    Taro.showModal({
      title: '呼叫咨询师',
      content: '确认呼叫您的专属咨询师？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已通知咨询师', icon: 'success' })
          console.log('[Navigation] 已呼叫咨询师:', consultantName)
        }
      }
    })
  }

  const handleStartGuide = () => {
    setShowGuide(true)
    setCompletedSteps([])
    if (navSteps.length > 0) {
      setCurrentStep(navSteps[0].key)
    }
    console.log('[Navigation] 开始室内导航，前往:', targetFloor, targetRoom)
  }

  const handleCloseGuide = () => {
    setShowGuide(false)
    setCurrentStep(null)
  }

  const handleStepConfirm = (stepKey: NavStepKey) => {
    const newCompleted = [...completedSteps, stepKey]
    setCompletedSteps(newCompleted)
    updateArriveProgress(stepKey)

    const currentIdx = navSteps.findIndex(s => s.key === stepKey)
    if (currentIdx < navSteps.length - 1) {
      const next = navSteps[currentIdx + 1]
      setCurrentStep(next.key)
      Taro.showToast({ title: '已确认到达', icon: 'success' })
      if (next.key === 'floor') {
        setViewFloor(targetFloor)
      }
    } else {
      setCurrentStep(null)
      Taro.showModal({
        title: '到达确认',
        content: `您已到达${targetRoom}门口，是否已进入面诊？`,
        confirmText: '已进入',
        cancelText: '还在门口',
        success: (res) => {
          if (res.confirm) {
            Taro.showToast({ title: '请与咨询师沟通', icon: 'success' })
            setTimeout(() => {
              Taro.switchTab({ url: '/pages/queue/index' })
            }, 800)
          }
        }
      })
    }
  }

  const generateRouteSteps = () => {
    const steps = []

    steps.push({
      text: '从当前位置出发',
      tip: '您现在在1楼大厅前台附近'
    })

    if (floorNum === 1) {
      steps.push({
        text: `前往${targetRoom}`,
        tip: '无需乘坐电梯，沿大厅右侧走廊前行约15米'
      })
    } else {
      steps.push({
        text: `乘坐电梯到${targetFloor}`,
        tip: '电梯位于大厅左侧，标识清晰可见'
      })

      const directions = ['左转', '右转', '直行后左转', '直行后右转']
      const randomDir = directions[targetRoom.charCodeAt(targetRoom.length - 1) % directions.length]
      const distances = ['约10米', '约15米', '约20米', '约25米']
      const randomDist = distances[targetRoom.charCodeAt(0) % distances.length]

      steps.push({
        text: `出电梯后${randomDir}`,
        tip: `沿走廊前行${randomDist}`
      })

      const sideHints = [
        '诊室在您的左手边',
        '诊室在您的右手边',
        '诊室正对电梯口',
        '诊室在走廊尽头'
      ]
      const sideHint = sideHints[(parseInt(targetRoom) + 1) % sideHints.length]

      steps.push({
        text: `到达${targetRoom}`,
        tip: `${sideHint}，请敲门进入`
      })
    }

    return steps
  }

  const routeSteps = generateRouteSteps()

  const getPointIcon = (type: MapPoint['type']) => {
    switch (type) {
      case 'current': return '📍'
      case 'target': return '🎯'
      case 'elevator': return '🛗'
      case 'stairs': return '🪜'
      case 'room': return '🚪'
      case 'lobby': return '🏷️'
      default: return '•'
    }
  }

  const isStepCompleted = (key: NavStepKey) => completedSteps.includes(key)
  const isStepCurrent = (key: NavStepKey) => currentStep === key

  if (!queueInfo) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.header}>
          <Text className={styles.title}>诊室路线</Text>
          <Text className={styles.subtitle}>暂无候诊信息</Text>
        </View>
        <View style={{ textAlign: 'center', padding: '80rpx 0' }}>
          <Text style={{ fontSize: '80rpx' }}>💡</Text>
          <Text style={{ display: 'block', marginTop: '24rpx', color: '#86909C' }}>
            请先完成导诊问卷获取候诊信息
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>诊室路线</Text>
        <Text className={styles.subtitle}>预计 {estimatedTime} 轮到您 · 请按指引前往</Text>
      </View>

      <View className={styles.roomCard}>
        <Text className={styles.roomLabel}>您的诊室</Text>
        <Text className={styles.roomNumber}>{targetRoom}</Text>
        <Text className={styles.roomFloor}>{targetFloor} · {consultant.name} 咨询师</Text>
        <View className={styles.consultantInfo}>
          <Image
            className={styles.consultantAvatar}
            src={consultant.avatar}
            mode="aspectFill"
          />
          <View>
            <Text className={styles.consultantName}>{consultant.name}</Text>
            <Text className={styles.consultantTitle}>{consultant.title}</Text>
          </View>
        </View>
      </View>

      {showGuide && (
        <View className={styles.guidePanel}>
          <View className={styles.guideHeader}>
            <View>
              <Text className={styles.guideTitle}>🧭 导航进行中</Text>
              <Text className={styles.guideProgress}>
                已完成 {completedSteps.length} / {navSteps.length} 步
              </Text>
            </View>
            <View className={styles.closeGuideBtn} onClick={handleCloseGuide}>
              <Text style={{ color: '#999', fontSize: '32rpx' }}>×</Text>
            </View>
          </View>

          <View className={styles.guideSteps}>
            {navSteps.map((step, idx) => {
              const done = isStepCompleted(step.key)
              const active = isStepCurrent(step.key)
              return (
                <View
                  key={step.key}
                  className={classnames(styles.guideStep, {
                    [styles.stepDone]: done,
                    [styles.stepActive]: active
                  })}
                >
                  <View className={styles.stepIconWrap}>
                    <Text className={styles.stepIconEmoji}>
                      {done ? '✅' : active ? step.icon : '⬜'}
                    </Text>
                    {idx < navSteps.length - 1 && (
                      <View className={classnames(styles.connector, {
                        [styles.connectorDone]: done
                      })} />
                    )}
                  </View>
                  <View className={styles.stepBody}>
                    <Text className={styles.guideStepTitle}>
                      {step.title}
                    </Text>
                    <Text className={styles.guideStepDesc}>{step.description}</Text>
                    {active && (
                      <Button
                        className={styles.confirmArriveBtn}
                        onClick={() => handleStepConfirm(step.key)}
                      >
                        <Text>✓</Text>
                        <Text className={styles.confirmArriveText}>
                          我已到达这里
                        </Text>
                      </Button>
                    )}
                    {done && (
                      <Text className={styles.doneBadge}>已确认到达</Text>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )}

      <View className={styles.mapSection}>
        <Text className={styles.sectionTitle}>楼层地图</Text>

        <View className={styles.floorTabs}>
          {navigationFloors.map((floor) => (
            <View
              key={floor.floor}
              className={classnames(styles.floorTab, {
                [styles.floorTabActive]: displayFloor === floor.floor,
                [styles.floorTabTarget]: targetFloor === floor.floor
              })}
              onClick={() => setViewFloor(floor.floor)}
            >
              <Text className={styles.floorTabText}>{floor.floor}</Text>
              {targetFloor === floor.floor && <Text className={styles.floorTabBadge}>目标</Text>}
            </View>
          ))}
        </View>

        <View className={styles.floorMapContainer}>
          <View className={styles.floorMapHeader}>
            <Text className={styles.floorMapTitle}>{displayFloor}平面图</Text>
            <Text className={styles.floorMapDesc}>
              {navigationFloors.find(f => f.floor === displayFloor)?.description}
            </Text>
          </View>

          <View className={styles.floorMapCanvas}>
            <View className={styles.mapGridBg}>
              {[1, 2, 3, 4].map(i => (
                <View key={`h${i}`} className={styles.gridHLine} style={{ top: `${i * 20}%` }} />
              ))}
              {[1, 2, 3, 4].map(i => (
                <View key={`v${i}`} className={styles.gridVLine} style={{ left: `${i * 20}%` }} />
              ))}
            </View>

            {floorMap.points.map((point) => (
              <View
                key={point.id}
                className={classnames(styles.mapPoint, styles[`point-${point.type}`], {
                  [styles.pulseHint]: showGuide && (
                    (point.type === 'elevator' && isStepCurrent('elevator')) ||
                    (point.type === 'target' && isStepCurrent('room'))
                  )
                })}
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`
                }}
              >
                <View className={styles.mapPointMarker}>
                  <Text className={styles.mapPointIcon}>{getPointIcon(point.type)}</Text>
                </View>
                <Text className={styles.mapPointLabel}>{point.label}</Text>
              </View>
            ))}

            <View className={styles.mapPathLine}>
              {displayFloor === '1楼' && floorNum !== 1 && (
                <View className={styles.pathArrow}>↑ 乘电梯/楼梯上楼</View>
              )}
              {displayFloor !== '1楼' && displayFloor === targetFloor && (
                <View className={styles.pathArrow}>→ 前往目标诊室</View>
              )}
            </View>
          </View>

          <View className={styles.mapLegend}>
            <View className={styles.legendItem}>
              <Text className={styles.legendIcon}>📍</Text>
              <Text className={styles.legendText}>当前位置</Text>
            </View>
            <View className={styles.legendItem}>
              <Text className={styles.legendIcon}>🎯</Text>
              <Text className={styles.legendText}>目标诊室</Text>
            </View>
            <View className={styles.legendItem}>
              <Text className={styles.legendIcon}>🛗</Text>
              <Text className={styles.legendText}>电梯</Text>
            </View>
            <View className={styles.legendItem}>
              <Text className={styles.legendIcon}>🪜</Text>
              <Text className={styles.legendText}>楼梯</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.routeSteps}>
        <Text className={styles.sectionTitle}>步行路线</Text>
        {routeSteps.map((step, index) => (
          <View key={index} className={styles.stepItem}>
            <View className={styles.stepCircle}>{index + 1}</View>
            <View className={styles.stepContent}>
              <Text className={styles.stepText}>{step.text}</Text>
              {step.tip && <Text className={styles.stepTip}>{step.tip}</Text>}
            </View>
            <View className={styles.stepLine} />
          </View>
        ))}
      </View>

      <View className={styles.callSection}>
        <Button className={styles.callButton} onClick={handleCallConsultant}>
          <Text>📞</Text>
          <Text className={styles.callButtonText}>呼叫{consultant.name}</Text>
        </Button>
        <Button className={classnames(styles.guideButton, { [styles.guideActive]: showGuide })} onClick={showGuide ? handleCloseGuide : handleStartGuide}>
          <Text>{showGuide ? '⏹️' : '🧭'}</Text>
          <Text className={styles.guideButtonText}>
            {showGuide ? '结束导航' : '开始导航'}
          </Text>
        </Button>
      </View>
    </View>
  )
}

export default NavigationPage
