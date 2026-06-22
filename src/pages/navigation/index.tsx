import React from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useConsultationStore } from '@/store/consultation'
import { navigationFloors, consultants } from '@/data/mock'
import styles from './index.module.scss'
import classnames from 'classnames'

const NavigationPage: React.FC = () => {
  const { queueInfo } = useConsultationStore()

  const targetRoom = queueInfo?.roomNumber || '305诊室'
  const targetFloor = queueInfo?.floor || '3楼'
  const consultantName = queueInfo?.consultantName || '李医生'

  const consultant = consultants.find(c => c.name === consultantName) || consultants[0]

  const handleCallConsultant = () => {
    Taro.showModal({
      title: '呼叫咨询师',
      content: '确认呼叫您的专属咨询师？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已通知咨询师', icon: 'success' })
          console.log('[Navigation] 已呼叫咨询师')
        }
      }
    })
  }

  const handleStartGuide = () => {
    Taro.showToast({ title: '导航功能开发中', icon: 'none' })
    console.log('[Navigation] 开始室内导航')
  }

  const routeSteps = [
    { text: '从当前位置出发', tip: '您现在在1楼大厅' },
    { text: '乘坐电梯到3楼', tip: '电梯位于大厅左侧' },
    { text: '出电梯后右转', tip: '沿走廊前行约20米' },
    { text: '到达305诊室', tip: '咨询师在您的左手边' }
  ]

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>诊室路线</Text>
        <Text className={styles.subtitle}>请按照指引前往您的诊室</Text>
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
        <Text className={styles.sectionTitle}>楼层分布</Text>
        <View className={styles.mapPlaceholder}>
          <Text className={styles.mapIcon}>🏢</Text>
          <Text className={styles.mapText}>室内地图加载中...</Text>
          <Text className={styles.mapMarker}>📍</Text>
        </View>

        <View className={styles.floorList}>
          {navigationFloors.map((floor, index) => (
            <View
              key={index}
              className={classnames(styles.floorItem, {
                [styles.active]: floor.floor === targetFloor
              })}
            >
              <View className={styles.floorTag}>
                <Text className={styles.floorTagText}>{floor.floor}</Text>
              </View>
              <View className={styles.floorContent}>
                <Text className={styles.floorName}>{floor.floor}</Text>
                <Text className={styles.floorDesc}>{floor.description}</Text>
                <View className={styles.floorRooms}>
                  {floor.rooms.map((room, roomIndex) => (
                    <Text
                      key={roomIndex}
                      className={classnames(styles.roomTag, {
                        [styles.targetRoom]: room === targetRoom
                      })}
                    >
                      {room}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
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
          <Text className={styles.callButtonText}>呼叫咨询师</Text>
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
