import React, { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useConsultationStore } from '@/store/consultation'
import { generateMockBoardCustomers } from '@/data/mock'
import { BoardCustomer, QueueStatus } from '@/types'
import styles from './index.module.scss'
import classnames from 'classnames'

const statusLabels: Record<QueueStatus, string> = {
  nurse_pending: '待护士复核',
  nurse_rejected: '暂缓咨询',
  waiting: '候诊中',
  almost: '快到号',
  called: '已叫号',
  consulting: '面诊中',
  done: '已完成'
}

const riskFlagLabels: Record<string, string> = {
  pregnant: '怀孕',
  breastfeeding: '哺乳',
  allergy: '过敏史',
  scar: '疤痕体质',
  disease: '慢性病',
  surgery: '近期手术'
}

interface TabItem {
  key: string
  label: string
  statuses?: QueueStatus[]
  icon: string
}

const tabs: TabItem[] = [
  { key: 'all', label: '全部', icon: '👥' },
  { key: 'checked_in', label: '已签到', icon: '✅' },
  { key: 'nurse_pending', label: '待护士复核', statuses: ['nurse_pending'], icon: '👩‍⚕️' },
  { key: 'waiting', label: '候诊中', statuses: ['waiting', 'almost'], icon: '⏳' },
  { key: 'called', label: '已叫号', statuses: ['called'], icon: '📢' },
  { key: 'consulting', label: '面诊中', statuses: ['consulting'], icon: '💬' }
]

interface StatusTimelineItem {
  status: QueueStatus | 'checked_in'
  label: string
  time: string
  completed: boolean
}

const generateTimeline = (customer: BoardCustomer, currentStatus: QueueStatus): StatusTimelineItem[] => {
  const statusOrder: (QueueStatus | 'checked_in')[] = [
    'checked_in',
    'nurse_pending',
    'waiting',
    'almost',
    'called',
    'consulting'
  ]

  const labelMap: Record<string, string> = {
    checked_in: '到院签到',
    nurse_pending: '等待护士复核',
    waiting: '进入候诊队列',
    almost: '即将叫号',
    called: '呼叫顾客',
    consulting: '开始面诊'
  }

  const currentIdx = statusOrder.indexOf(currentStatus)
  const checkInHour = parseInt(customer.checkInTime.split(':')[0])
  const checkInMin = parseInt(customer.checkInTime.split(':')[1])

  return statusOrder.map((status, idx) => {
    const completed = idx <= currentIdx
    let time = customer.checkInTime

    if (idx > 0) {
      const offsetMin = idx * 8 + Math.floor(Math.random() * 10)
      const totalMin = checkInHour * 60 + checkInMin + offsetMin
      const newHour = Math.floor(totalMin / 60)
      const newMin = totalMin % 60
      time = `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`
    }

    return {
      status,
      label: labelMap[status],
      time: completed ? time : '--:--',
      completed
    }
  })
}

const BoardPage: React.FC = () => {
  const { boardCustomers, addBoardCustomer } = useConsultationStore()
  const [activeTab, setActiveTab] = useState('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (boardCustomers.length === 0) {
      generateMockBoardCustomers().forEach(c => addBoardCustomer(c))
    }
  }, [boardCustomers.length, addBoardCustomer])

  const handleBack = () => {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: '/pages/index/index' })
    })
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getFilteredCustomers = (): BoardCustomer[] => {
    if (activeTab === 'all') {
      return boardCustomers
    }
    if (activeTab === 'checked_in') {
      return boardCustomers
    }
    const tab = tabs.find(t => t.key === activeTab)
    if (tab?.statuses) {
      return boardCustomers.filter(c => tab.statuses!.includes(c.status))
    }
    return boardCustomers
  }

  const getStatsCount = () => {
    const counts = {
      checked_in: boardCustomers.length,
      nurse_pending: 0,
      waiting: 0,
      called: 0,
      consulting: 0
    }
    boardCustomers.forEach(c => {
      if (c.status === 'nurse_pending') counts.nurse_pending++
      if (c.status === 'waiting' || c.status === 'almost') counts.waiting++
      if (c.status === 'called') counts.called++
      if (c.status === 'consulting') counts.consulting++
    })
    return counts
  }

  const getTabCount = (tabKey: string): number => {
    if (tabKey === 'all') return boardCustomers.length
    if (tabKey === 'checked_in') return boardCustomers.length
    const tab = tabs.find(t => t.key === tabKey)
    if (tab?.statuses) {
      return boardCustomers.filter(c => tab.statuses!.includes(c.status)).length
    }
    return 0
  }

  const stats = getStatsCount()
  const filteredCustomers = getFilteredCustomers()

  const getQueuePrefix = (queueNumber: string) => {
    return queueNumber.replace(/[0-9]/g, '')
  }

  const getQueueNumber = (queueNumber: string) => {
    return queueNumber.replace(/[^0-9]/g, '')
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.navHeader}>
        <View className={styles.backBtn} onClick={handleBack}>
          <Text className={styles.backIcon}>←</Text>
        </View>
        <Text className={styles.headerTitle}>导诊看板</Text>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statsGrid}>
          <View className={classnames(styles.statCard, styles.checked_in)}>
            <Text className={styles.statIcon}>✅</Text>
            <Text className={styles.statValue}>{stats.checked_in}</Text>
            <Text className={styles.statLabel}>已签到</Text>
          </View>
          <View className={classnames(styles.statCard, styles.nurse_pending)}>
            <Text className={styles.statIcon}>👩‍⚕️</Text>
            <Text className={styles.statValue}>{stats.nurse_pending}</Text>
            <Text className={styles.statLabel}>待护士复核</Text>
          </View>
          <View className={classnames(styles.statCard, styles.waiting)}>
            <Text className={styles.statIcon}>⏳</Text>
            <Text className={styles.statValue}>{stats.waiting}</Text>
            <Text className={styles.statLabel}>候诊中</Text>
          </View>
          <View className={classnames(styles.statCard, styles.called)}>
            <Text className={styles.statIcon}>📢</Text>
            <Text className={styles.statValue}>{stats.called}</Text>
            <Text className={styles.statLabel}>已叫号</Text>
          </View>
          <View className={classnames(styles.statCard, styles.consulting)}>
            <Text className={styles.statIcon}>💬</Text>
            <Text className={styles.statValue}>{stats.consulting}</Text>
            <Text className={styles.statLabel}>面诊中</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabsSection}>
        <View className={styles.tabsScroll}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.tabItem, { [styles.active]: activeTab === tab.key })}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.icon}</Text>
              <Text className={styles.tabText}>{tab.label}</Text>
              <Text className={styles.tabCount}>{getTabCount(tab.key)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.listSection}>
        {filteredCustomers.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyTitle}>暂无顾客数据</Text>
            <Text className={styles.emptyDesc}>当前筛选条件下暂无顾客信息</Text>
          </View>
        ) : (
          filteredCustomers.map(customer => {
            const isExpanded = expandedIds.has(customer.id)
            const timeline = generateTimeline(customer, customer.status)
            return (
              <View key={customer.id} className={styles.customerCard}>
                <View
                  className={classnames(styles.cardHeader, { [styles.expanded]: isExpanded })}
                  onClick={() => toggleExpand(customer.id)}
                >
                  <View className={styles.queueBadge}>
                    <Text className={styles.queuePrefix}>{getQueuePrefix(customer.queueNumber)}</Text>
                    <Text className={styles.queueNum}>{getQueueNumber(customer.queueNumber)}</Text>
                  </View>
                  <View className={styles.cardInfo}>
                    <View className={styles.nameRow}>
                      <Text className={styles.customerName}>{customer.name}</Text>
                      <View className={classnames(styles.statusTag, styles[customer.status])}>
                        <Text>{statusLabels[customer.status]}</Text>
                      </View>
                    </View>
                    <View className={styles.metaRow}>
                      <View className={styles.metaItem}>
                        <Text className={styles.metaIcon}>⏰</Text>
                        <Text>{customer.checkInTime}</Text>
                      </View>
                      <View className={styles.metaItem}>
                        <Text className={styles.metaIcon}>👩‍⚕️</Text>
                        <Text>{customer.consultantName}</Text>
                      </View>
                      <View className={styles.metaItem}>
                        <Text className={styles.metaIcon}>🏥</Text>
                        <Text>{customer.roomNumber}</Text>
                      </View>
                    </View>
                  </View>
                  <View className={styles.expandBtn}>
                    <Text className={styles.expandIcon}>▼</Text>
                  </View>
                </View>

                {isExpanded && (
                  <View className={styles.cardExpand}>
                    <View className={styles.detailSection}>
                      <Text className={styles.detailTitle}>联系电话</Text>
                      <View className={styles.phoneRow}>
                        <Text className={styles.phoneIcon}>📱</Text>
                        <Text className={styles.phoneText}>{customer.phone || '138****8888'}</Text>
                      </View>
                    </View>

                    {customer.riskFlags && customer.riskFlags.length > 0 && (
                      <View className={styles.detailSection}>
                        <Text className={styles.detailTitle}>风险提示</Text>
                        <View className={styles.riskList}>
                          {customer.riskFlags.map(flag => (
                            <View key={flag} className={styles.riskTag}>
                              <Text>⚠️ {riskFlagLabels[flag] || flag}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    <View className={styles.detailSection}>
                      <Text className={styles.detailTitle}>状态变更时间线</Text>
                      <View className={styles.timeline}>
                        {timeline.map((item, idx) => (
                          <View
                            key={idx}
                            className={classnames(styles.timelineItem, {
                              [styles.completed]: item.completed,
                              [styles.pending]: !item.completed
                            })}
                          >
                            <View className={styles.timelineDot}></View>
                            <Text className={styles.timelineTime}>{item.time}</Text>
                            <Text className={styles.timelineText}>{item.label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )
          })
        )}
      </View>
    </View>
  )
}

export default BoardPage
