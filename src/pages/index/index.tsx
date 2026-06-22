import React, { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useConsultationStore } from '@/store/consultation'
import { validAppointmentCodes } from '@/data/mock'

const IndexPage: React.FC = () => {
  const [appointmentCode, setAppointmentCode] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [locationVerified, setLocationVerified] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const { setIsCheckedIn, setUserInfo, isCheckedIn, setConsultationData, consultationData } = useConsultationStore()

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

  const validateAppointmentCode = (code: string): boolean => {
    return validAppointmentCodes.hasOwnProperty(code.toUpperCase())
  }

  const handleGetLocation = () => {
    Taro.showLoading({ title: '定位中...' })

    if (process.env.TARO_ENV === 'h5' || process.env.TARO_ENV === undefined) {
      setTimeout(() => {
        Taro.hideLoading()
        setLocationVerified(true)
        Taro.showToast({ title: '已确认您在门店附近', icon: 'success' })
        console.log('[CheckIn] H5 定位验证通过（模拟）')
      }, 1500)
      return
    }

    Taro.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('[CheckIn] 定位成功:', res.latitude, res.longitude)
        const storeLatitude = 39.9042
        const storeLongitude = 116.4074
        const distance = calculateDistance(
          res.latitude, res.longitude,
          storeLatitude, storeLongitude
        )
        console.log('[CheckIn] 距离门店:', distance, '米')

        setTimeout(() => {
          Taro.hideLoading()
          if (distance <= 500) {
            setLocationVerified(true)
            Taro.showToast({ title: '已确认您在门店附近', icon: 'success' })
          } else {
            Taro.showModal({
              title: '定位提示',
              content: `检测到您距离门店约 ${Math.round(distance)} 米，您已到店了吗？`,
              confirmText: '我已到店',
              cancelText: '还没到',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  setLocationVerified(true)
                }
              }
            })
          }
        }, 1000)
      },
      fail: (err) => {
        console.error('[CheckIn] 定位失败:', err)
        Taro.hideLoading()
        Taro.showModal({
          title: '定位失败',
          content: '无法获取当前位置，您已到门店了吗？',
          confirmText: '我已到店',
          cancelText: '重新定位',
          success: (modalRes) => {
            if (modalRes.confirm) {
              setLocationVerified(true)
            } else {
              handleGetLocation()
            }
          }
        })
      }
    })
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleStart = () => {
    if (!appointmentCode) {
      Taro.showToast({ title: '请输入预约码', icon: 'none' })
      return
    }

    setIsVerifyingCode(true)

    setTimeout(() => {
      const isValid = validateAppointmentCode(appointmentCode)
      setIsVerifyingCode(false)

      if (!isValid) {
        Taro.showModal({
          title: '预约码无效',
          content: '未查询到该预约码的预约记录，请检查预约码是否正确，或联系前台工作人员协助。',
          showCancel: false,
          confirmText: '我知道了'
        })
        console.warn('[CheckIn] 预约码验证失败:', appointmentCode)
        return
      }

      if (!locationVerified) {
        Taro.showToast({ title: '请先完成定位验证', icon: 'none' })
        return
      }

      const appointmentInfo = validAppointmentCodes[appointmentCode.toUpperCase()]
      setIsCheckedIn(true)
      setUserInfo({
        appointmentCode: appointmentCode.toUpperCase(),
        name: appointmentInfo.name,
        phone: appointmentInfo.phone
      })
      setConsultationData({
        ...consultationData,
        basicInfo: {
          ...consultationData.basicInfo,
          name: appointmentInfo.name,
          phone: appointmentInfo.phone
        }
      })

      console.log('[CheckIn] 签到成功，预约码:', appointmentCode, '用户信息:', appointmentInfo)

      Taro.navigateTo({
        url: '/pages/privacy/index'
      })
    }, 600)
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.welcomeIcon}>🌸</Text>
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
              <Text className={classnames(styles.statusDot, {
                [styles.statusDotInactive]: !locationVerified
              })}></Text>
              {locationVerified ? '已确认在门店附近' : '点击验证您的位置'}
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
            <Text className={styles.tipItem}>测试预约码：YM20240001、TEST001</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomSection}>
        <View
          className={classnames(styles.startButton, {
            [styles.disabled]: !appointmentCode || !locationVerified || isVerifyingCode
          })}
          onClick={handleStart}
        >
          <Text className={styles.startButtonText}>
            {isVerifyingCode ? '验证中...' : (isCheckedIn ? '继续导诊' : '开始导诊')}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default IndexPage
