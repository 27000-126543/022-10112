import React, { useEffect, useState } from 'react'
import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useConsultationStore } from '@/store/consultation'
import { generateMockBoardCustomers, riskQuestions } from '@/data/mock'
import { BoardCustomer } from '@/types'
import styles from './index.module.scss'
import classnames from 'classnames'

const riskLabelMap: Record<string, string> = {
  pregnant: '怀孕',
  allergy: '过敏史',
  scar: '疤痕',
  disease: '慢性病',
  surgery: '近期手术',
  breastfeeding: '哺乳'
}

const highRiskFlags = ['pregnant', 'scar', 'breastfeeding']
const mediumRiskFlags = ['allergy', 'disease', 'surgery']

const NursePage: React.FC = () => {
  const { boardCustomers, addBoardCustomer, setNurseReviewResult } = useConsultationStore()
  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    if (boardCustomers.length === 0 && __DEV__) {
      generateMockBoardCustomers().forEach(c => addBoardCustomer(c))
    }
  }, [addBoardCustomer, boardCustomers.length])

  const pendingCustomers = boardCustomers
    .filter(c => c.status === 'nurse_pending')
    .sort((a, b) => a.checkInTime.localeCompare(b.checkInTime))

  const processedCustomers = boardCustomers.filter(
    c => c.status === 'waiting' || c.status === 'nurse_rejected'
  )

  const getRiskClass = (flag: string): string => {
    if (highRiskFlags.includes(flag)) return styles.riskHigh
    if (mediumRiskFlags.includes(flag)) return styles.riskMedium
    return styles.riskLow
  }

  const handleNoteChange = (customerId: string, value: string) => {
    setNotes(prev => ({ ...prev, [customerId]: value }))
  }

  const handleToggleExpand = (customerId: string) => {
    setExpandedId(prev => (prev === customerId ? null : customerId))
  }

  const handleApprove = (customer: BoardCustomer) => {
    const note = notes[customer.id] || ''
    setNurseReviewResult('approved', note, customer.id)
    setExpandedId(null)
    Taro.showToast({ title: '复核通过', icon: 'success' })
  }

  const handlePostpone = (customer: BoardCustomer) => {
    const note = notes[customer.id] || ''
    setNurseReviewResult('postponed', note, customer.id)
    setExpandedId(null)
    Taro.showToast({ title: '已暂缓', icon: 'none' })
  }

  const getProcessedTag = (status: string) => {
    if (status === 'waiting') return { text: '已通过', className: styles.tagApproved }
    if (status === 'nurse_rejected') return { text: '暂缓咨询', className: styles.tagPostponed }
    return null
  }

  const renderRiskFlags = (flags: string[], compact: boolean = false) => {
    if (!flags || flags.length === 0) return null
    return (
      <View className={compact ? styles.riskTagsCompact : styles.riskTags}>
        {flags.map(flag => (
          <Text
            key={flag}
            className={classnames(
              styles.riskTag,
              getRiskClass(flag),
              compact && styles.riskTagCompact
            )}
          >
            {riskLabelMap[flag] || flag}
          </Text>
        ))}
      </View>
    )
  }

  const renderCustomerCard = (customer: BoardCustomer, isProcessed: boolean = false) => {
    const isExpanded = expandedId === customer.id
    const processedTag = getProcessedTag(customer.status)

    return (
      <View
        key={customer.id}
        className={classnames(styles.customerCard, {
          [styles.cardExpanded]: isExpanded,
          [styles.cardProcessed]: isProcessed
        })}
        onClick={() => !isProcessed && handleToggleExpand(customer.id)}
      >
        <View className={styles.cardHeader}>
          <View className={styles.queueBadge}>
            <Text className={styles.queueNumber}>{customer.queueNumber}</Text>
          </View>
          <View className={styles.customerInfo}>
            <Text className={styles.customerName}>{customer.name}</Text>
            <View className={styles.metaRow}>
              <Text className={styles.metaText}>🕐 {customer.checkInTime} 签到</Text>
              <Text className={styles.metaDot}>·</Text>
              <Text className={styles.metaText}>{customer.floor} {customer.roomNumber}</Text>
            </View>
          </View>
          {isProcessed && processedTag && (
            <View className={processedTag.className}>
              <Text className={styles.tagText}>{processedTag.text}</Text>
            </View>
          )}
          {!isProcessed && (
            <View className={styles.expandIcon}>
              <Text className={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
            </View>
          )}
        </View>

        {renderRiskFlags(customer.riskFlags, !isExpanded)}

        {isExpanded && !isProcessed && (
          <View className={styles.expandedPanel}>
            <View className={styles.riskDetailSection}>
              <Text className={styles.sectionTitle}>⚠️ 风险项详情</Text>
              {customer.riskFlags && customer.riskFlags.length > 0 ? (
                <View className={styles.riskDetailList}>
                  {customer.riskFlags.map(flag => {
                    const question = riskQuestions.find(q => q.id === flag)
                    return (
                      <View key={flag} className={styles.riskDetailItem}>
                        <View className={classnames(styles.riskDot, getRiskClass(flag))} />
                        <View className={styles.riskDetailContent}>
                          <Text className={styles.riskDetailLabel}>
                            {riskLabelMap[flag] || flag}
                          </Text>
                          {question?.tip && (
                            <Text className={styles.riskDetailTip}>{question.tip}</Text>
                          )}
                        </View>
                      </View>
                    )
                  })}
                </View>
              ) : (
                <Text className={styles.noRiskText}>暂无风险项</Text>
              )}
            </View>

            <View className={styles.noteSection}>
              <Text className={styles.sectionTitle}>📝 护士备注</Text>
              <Textarea
                className={styles.noteTextarea}
                placeholder='请输入备注信息（选填），如：建议暂缓项目类型、后续注意事项等...'
                value={notes[customer.id] || ''}
                onInput={(e) => handleNoteChange(customer.id, e.detail.value)}
                maxlength={200}
              />
            </View>

            <View className={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
              <Button
                className={classnames(styles.actionBtn, styles.btnApprove)}
                onClick={(e) => { e.stopPropagation(); handleApprove(customer) }}
              >
                <Text className={styles.btnIcon}>✓</Text>
                <Text className={styles.btnText}>复核通过</Text>
              </Button>
              <Button
                className={classnames(styles.actionBtn, styles.btnPostpone)}
                onClick={(e) => { e.stopPropagation(); handlePostpone(customer) }}
              >
                <Text className={styles.btnIcon}>⚠</Text>
                <Text className={styles.btnText}>暂缓咨询</Text>
              </Button>
            </View>
          </View>
        )}

        {isProcessed && customer.nurseNote && (
          <View className={styles.historyNote}>
            <Text className={styles.historyNoteLabel}>护士备注：</Text>
            <Text className={styles.historyNoteText}>{customer.nurseNote}</Text>
          </View>
        )}
      </View>
    )
  }

  const currentList = activeTab === 'pending' ? pendingCustomers : processedCustomers

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <View className={styles.headerBg} />
        <View className={styles.headerContent}>
          <View className={styles.headerRow}>
            <Text className={styles.headerIcon}>👩‍⚕️</Text>
            <Text className={styles.headerTitle}>护士工作台</Text>
          </View>
          <View className={styles.pendingAlert}>
            <Text className={styles.alertIcon}>🔔</Text>
            <Text className={styles.alertText}>
              当前待复核顾客 <Text className={styles.alertCount}>{pendingCustomers.length}</Text> 位
            </Text>
            {pendingCustomers.length > 0 && (
              <Text className={styles.alertHint}>请优先处理高风险顾客</Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, { [styles.tabActive]: activeTab === 'pending' })}
          onClick={() => setActiveTab('pending')}
        >
          <Text className={styles.tabText}>待处理</Text>
          <View className={styles.tabBadge}>{pendingCustomers.length}</View>
        </View>
        <View
          className={classnames(styles.tabItem, { [styles.tabActive]: activeTab === 'processed' })}
          onClick={() => setActiveTab('processed')}
        >
          <Text className={styles.tabText}>已处理</Text>
          <View className={classnames(styles.tabBadge, styles.tabBadgeLight)}>
            {processedCustomers.length}
          </View>
        </View>
      </View>

      <View className={styles.listContainer}>
        {currentList.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>
              {activeTab === 'pending' ? '🎉' : '📋'}
            </Text>
            <Text className={styles.emptyTitle}>
              {activeTab === 'pending' ? '暂无待复核顾客' : '暂无处理记录'}
            </Text>
            <Text className={styles.emptyDesc}>
              {activeTab === 'pending' ? '请耐心等待顾客签到' : '处理记录会显示在这里'}
            </Text>
          </View>
        ) : (
          currentList.map(customer =>
            renderCustomerCard(customer, activeTab === 'processed')
          )
        )}
      </View>
    </View>
  )
}

export default NursePage
