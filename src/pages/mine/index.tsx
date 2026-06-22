import React from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useConsultationStore } from '@/store/consultation'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const { userInfo, isCheckedIn, resetAll } = useConsultationStore()

  const isLoggedIn = userInfo.phone && userInfo.phone !== ''

  const handleLogin = () => {
    Taro.showToast({ title: '登录功能开发中', icon: 'none' })
  }

  const handleEditProfile = () => {
    Taro.showToast({ title: '编辑资料', icon: 'none' })
  }

  const handleMenuClick = (type: string) => {
    const messages: Record<string, string> = {
      appointment: '我的预约',
      history: '历史记录',
      reports: '检查报告',
      favorites: '我的收藏',
      messages: '消息通知',
      settings: '设置',
      help: '帮助中心',
      about: '关于我们',
      contact: '联系客服'
    }
    Taro.showToast({ title: `${messages[type] || '功能'}开发中`, icon: 'none' })
    console.log('[Mine] 点击菜单:', type)
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          resetAll()
          Taro.showToast({ title: '已退出登录', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.avatar}>
          <Text className={styles.avatarIcon}>👤</Text>
        </View>
        <View className={styles.userInfo}>
          <Text className={styles.userName}>
            {isLoggedIn ? userInfo.name || '美丽顾客' : '未登录'}
          </Text>
          <Text className={styles.userPhone}>
            {isLoggedIn ? userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '点击登录享受更多服务'}
          </Text>
        </View>
        {isLoggedIn && (
          <Button className={styles.editButton} onClick={handleEditProfile}>
            <Text className={styles.editButtonText}>编辑</Text>
          </Button>
        )}
      </View>

      {!isLoggedIn ? (
        <View className={styles.loginPrompt}>
          <Text className={styles.loginIcon}>🌸</Text>
          <Text className={styles.loginText}>登录后查看更多专属服务</Text>
          <Button className={styles.loginButton} onClick={handleLogin}>
            <Text className={styles.loginButtonText}>立即登录</Text>
          </Button>
        </View>
      ) : (
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>3</Text>
            <Text className={styles.statLabel}>预约</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>8</Text>
            <Text className={styles.statLabel}>到院</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>12</Text>
            <Text className={styles.statLabel}>项目</Text>
          </View>
        </View>
      )}

      <Text className={styles.sectionTitle}>我的服务</Text>
      <View className={styles.menuCard}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('appointment')}>
          <Text className={styles.menuIcon}>📅</Text>
          <Text className={styles.menuText}>我的预约</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('history')}>
          <Text className={styles.menuIcon}>📋</Text>
          <Text className={styles.menuText}>历史记录</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('reports')}>
          <Text className={styles.menuIcon}>📊</Text>
          <Text className={styles.menuText}>检查报告</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('favorites')}>
          <Text className={styles.menuIcon}>❤️</Text>
          <Text className={styles.menuText}>我的收藏</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>其他</Text>
      <View className={styles.menuCard}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('messages')}>
          <Text className={styles.menuIcon}>🔔</Text>
          <Text className={styles.menuText}>消息通知</Text>
          <Text className={styles.menuBadge}>3</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('settings')}>
          <Text className={styles.menuIcon}>⚙️</Text>
          <Text className={styles.menuText}>设置</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('help')}>
          <Text className={styles.menuIcon}>❓</Text>
          <Text className={styles.menuText}>帮助中心</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('contact')}>
          <Text className={styles.menuIcon}>💬</Text>
          <Text className={styles.menuText}>联系客服</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('about')}>
          <Text className={styles.menuIcon}>ℹ️</Text>
          <Text className={styles.menuText}>关于我们</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      {isLoggedIn && (
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleLogout}>
            <Text className={styles.menuIcon}>🚪</Text>
            <Text className={styles.menuText}>退出登录</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default MinePage
