import React, { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useConsultationStore } from '@/store/consultation'

const IndexPage: React.FC = () => {
  const [appointmentCode, setAppointmentCode] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [locationVerified, setLocationVerified] = useState(true)
  const { setIsCheckedIn, setUserInfo, isCheckedIn } = useConsultationStore()

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        console.log('[CheckIn] 扫码结果:', res.result)
        setAppointmentCode(res.result)
        Taro.showToast({ title: '扫码成功', icon: 'success' })
      },
      fail: (err) => {
        console.error('[CheckIn] 扫码失败:', err)
        Taro.showToast({ title: '扫码失败，请重试', icon: 'none' })
      }
    })
  }

  const handleGetLocation = () => {
    Taro.showLoading({ title: '定位中...' })
    setTimeout(() => {
      Taro.hideLoading()
      setLocationVerified(true)
      Taro.showToast({ title: '定位成功', icon: 'success' })
    }, 1500)
  }

  const handleStart = () => {
    if (!appointmentCode) {
      Taro.showToast({ title: '请输入预约码', icon: 'none' })
      return
    }
    if (!locationVerified) {
      Taro.showToast({ title: '请先完成定位验证', icon: 'none' })
      return
    }

    setIsCheckedIn(true)
    setUserInfo({ appointmentCode })

    console.log('[CheckIn] 签到成功，预约码:', appointmentCode)

    Taro.navigateTo({
      url: '/pages/privacy/index'
    })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.welcomeIcon}>�</Text>
        <Text className={styles.welcomeTitle}>欢迎来到美丽医美</Text>
        <Text className={styles.welcomeSubtitle}>自助导诊，让您的到院体验更轻松</Text>
        <View className={styles.storeName}>
          <Text className={styles.storeIcon}>📍</Text>
          <Text className={styles.storeText}>北京朝阳店</Text>
        </View>
      </View>

      <View className={styles.checkinCard}>
        <Text className={styles.cardTitle}>到院签到</Text>

        <View className={styles.inputSection}>
          <Text className={styles.inputLabel}>预约码</Text>
          <View className={classnames(styles.inputWrapper, { [styles.focused]: isInputFocused })}>
            <Input
              className={styles.codeInput}
              placeholder="请输入您的预约码"
              placeholderClass="input-placeholder"
              value={appointmentCode}
              onInput={(e) => setAppointmentCode(e.detail.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              maxlength={12}
            />
            <Button className={styles.scanButton} onClick={handleScan}>
              <Text className={styles.scanIcon}>📷</Text>
              <Text className={styles.scanText}>扫码</Text>
            </Button>
          </View>
        </View>

        <View className={styles.locationSection} onClick={handleGetLocation}>
          <Text className={styles.locationIcon}>📍</Text>
          <View className={styles.locationInfo}>
            <Text className={styles.locationText}>到店定位验证</Text>
            <Text className={styles.locationStatus}>
              <Text className={styles.statusDot}></Text>
              {locationVerified ? '已确认到店' : '点击验证位置'}
            </Text>
          </View>
          <Text className={styles.scanText}>{locationVerified ? '✓' : '›'}</Text>
        </View>

        <View className={styles.tipsSection}>
          <Text className={styles.tipsTitle}>💡 温馨提示</Text>
          <View className={styles.tipsList}>
            <Text className={styles.tipItem}>首次到院顾客请先完成自助导诊</Text>
            <Text className={styles.tipItem}>全程大约需要3-5分钟</Text>
            <Text className={styles.tipItem}>如有疑问可随时咨询前台工作人员</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomSection}>
        <View
          className={classnames(styles.startButton, {
            [styles.disabled]: !appointmentCode || !locationVerified
          })}
          onClick={handleStart}
        >
          <Text className={styles.startButtonText}>
            {isCheckedIn ? '继续导诊' : '开始导诊'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default IndexPage
