import React, { useState, useMemo } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useConsultationStore } from '@/store/consultation'
import { navigationFloors, consultants, getFloorMap } from '@/data/mock'
import { MapPoint } from '@/types'
import styles from './index.module.scss'
import classnames from 'classnames'

const NavigationPage: React.FC = () => {
  const { queueInfo } = useConsultationStore()
  const [viewFloor, setViewFloor] = useState<string>('')

  const targetRoom = queueInfo?.roomNumber || '305诊室'
  const targetFloor = queueInfo?.floor || '3楼'
  const consultantName = queueInfo?.consultantName || '李医生'
  const estimatedTime = queueInfo?.estimatedTime || '--:--'

  const consultant = consultants.find(c => c.name === consultantName) || consultants[0]

  const displayFloor = viewFloor || targetFloor
  const floorMap = useMemo(() => getFloorMap(displayFloor, targetRoom), [displayFloor, targetRoom])

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
    Taro.showToast({ title: '导航功能开发中', icon: 'none' })
    console.log('[Navigation] 开始室内导航，前往:', targetFloor, targetRoom)
  }

  const floorNum = parseInt(targetFloor) || 3

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
                className={classnames(styles.mapPoint, styles[`point-${point.type}`])}
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
        <Button className={styles.guideButton} onClick={handleStartGuide}>
          <Text>🧭</Text>
          <Text className={styles.guideButtonText}>开始导航</Text>
        </Button>
      </View>
    </View>
  )
}

export default NavigationPage
