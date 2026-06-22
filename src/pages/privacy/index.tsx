import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useConsultationStore } from '@/store/consultation'
import styles from './index.module.scss'

const PrivacyPage: React.FC = () => {
  const { privacyAgreed, setPrivacyAgreed } = useConsultationStore()
  const [agreedItems, setAgreedItems] = useState<string[]>(
    privacyAgreed ? ['privacy', 'terms', 'health'] : []
  )

  const agreementItems = [
    {
      id: 'privacy',
      text: '我已阅读并同意《用户隐私政策》',
      required: true
    },
    {
      id: 'terms',
      text: '我已阅读并同意《服务条款》',
      required: true
    },
    {
      id: 'health',
      text: '我同意将健康信息用于咨询服务',
      required: false
    }
  ]

  const handleToggleAgreement = (id: string) => {
    setAgreedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const canProceed = agreementItems
    .filter(item => item.required)
    .every(item => agreedItems.includes(item.id))

  const handleConfirm = () => {
    if (!canProceed) {
      Taro.showToast({ title: '请先同意必要的协议', icon: 'none' })
      return
    }

    setPrivacyAgreed(true)
    console.log('[Privacy] 隐私授权已同意:', agreedItems)

    Taro.navigateTo({
      url: '/pages/consultation/index'
    })
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.headerIcon}>🔒</Text>
        <Text className={styles.headerTitle}>隐私授权</Text>
        <Text className={styles.headerDesc}>我们重视您的隐私，请仔细阅读以下内容</Text>
      </View>

      <View className={styles.privacyCard}>
        <Text className={styles.cardTitle}>隐私政策摘要</Text>
        <ScrollView scrollY className={styles.privacyContent}>
          <Text className={styles.sectionTitle}>1. 信息收集</Text>
          <Text className={styles.sectionText}>
            为了给您提供更好的医美咨询服务，我们需要收集您的基本信息（姓名、联系方式）和健康相关信息。这些信息仅用于咨询服务，不会泄露给第三方。
          </Text>

          <Text className={styles.sectionTitle}>2. 信息使用</Text>
          <Text className={styles.sectionText}>
            您的个人信息将用于预约确认、就诊提醒、术后随访等服务。健康信息将由专业医疗人员进行评估，为您提供个性化建议。
          </Text>

          <Text className={styles.sectionTitle}>3. 信息保护</Text>
          <Text className={styles.sectionText}>
            我们采用行业标准的数据加密和安全措施，保护您的个人信息不被未授权访问。只有授权的医护人员才能查看您的信息。
          </Text>

          <Text className={styles.sectionTitle}>4. 您的权利</Text>
          <Text className={styles.sectionText}>
            您有权随时查询、更正、删除您的个人信息，也可以撤回授权。如有任何疑问，请联系我们的客服人员。
          </Text>

          <Text className={styles.sectionTitle}>5. 联系方式</Text>
          <Text className={styles.sectionText}>
            如对隐私政策有任何疑问，请拨打客服热线：400-xxx-xxxx
          </Text>
        </ScrollView>
      </View>

      <View className={styles.agreementSection}>
        {agreementItems.map(item => (
          <View
            key={item.id}
            className={styles.agreementItem}
            onClick={() => handleToggleAgreement(item.id)}
          >
            <View
              className={classnames(styles.checkbox, {
                [styles.checked]: agreedItems.includes(item.id)
              })}
            >
              {agreedItems.includes(item.id) && (
                <Text className={styles.checkIcon}>✓</Text>
              )}
            </View>
            <Text className={styles.agreementText}>
              {item.text}
              {item.required && <Text className={styles.highlight}> *</Text>}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.bottomSection}>
        <View className={styles.backButton} onClick={handleBack}>
          <Text className={styles.backButtonText}>返回</Text>
        </View>
        <View
          className={classnames(styles.confirmButton, {
            [styles.disabled]: !canProceed
          })}
          onClick={handleConfirm}
        >
          <Text className={styles.confirmButtonText}>同意并继续</Text>
        </View>
      </View>
    </View>
  )
}

export default PrivacyPage
