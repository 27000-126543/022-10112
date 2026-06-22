import React, { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useConsultationStore } from '@/store/consultation'
import { riskQuestions, generateQueueInfo } from '@/data/mock'
import styles from './index.module.scss'

const nurseReviewFlags = ['pregnant', 'breastfeeding', 'allergy', 'scar', 'disease', 'surgery']

const RiskPage: React.FC = () => {
  const { consultationData, setConsultationData, setQueueInfo, setCurrentStep } = useConsultationStore()
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    pregnant: consultationData.isPregnant,
    breastfeeding: consultationData.isBreastfeeding,
    allergy: consultationData.hasAllergy,
    scar: false,
    disease: false,
    surgery: false
  })
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(consultationData.uploadFiles)

  const handleAnswer = (questionId: string, answer: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleUpload = () => {
    Taro.chooseImage({
      count: 3 - uploadedFiles.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newFiles = res.tempFilePaths
        setUploadedFiles(prev => [...prev, ...newFiles].slice(0, 3))
        console.log('[Risk] 上传图片:', newFiles)
      },
      fail: (err) => {
        console.error('[Risk] 上传图片失败:', err)
      }
    })
  }

  const handleRemoveImage = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const checkNeedNurseReview = (): boolean => {
    for (const flag of nurseReviewFlags) {
      if (answers[flag] === true) {
        return true
      }
    }
    return false
  }

  const hasHighRisk = checkNeedNurseReview()

  const getRiskSummaryText = (): string => {
    const activeRisks: string[] = []
    if (answers.pregnant) activeRisks.push('孕期/备孕期')
    if (answers.breastfeeding) activeRisks.push('哺乳期')
    if (answers.allergy) activeRisks.push('过敏史')
    if (answers.scar) activeRisks.push('疤痕体质')
    if (answers.disease) activeRisks.push('慢性疾病')
    if (answers.surgery) activeRisks.push('半年内医美手术')
    return activeRisks.join('、')
  }

  const handleSubmit = () => {
    const riskFlags: string[] = []
    Object.entries(answers).forEach(([key, value]) => {
      if (value) riskFlags.push(key)
    })

    setConsultationData({
      isPregnant: answers.pregnant,
      isBreastfeeding: answers.breastfeeding,
      hasAllergy: answers.allergy,
      riskFlags,
      uploadFiles: uploadedFiles
    })

    console.log('[Risk] 风险评估完成:', {
      riskFlags,
      isPregnant: answers.pregnant,
      isBreastfeeding: answers.breastfeeding,
      hasAllergy: answers.allergy,
      hasScar: answers.scar,
      hasDisease: answers.disease,
      hasRecentSurgery: answers.surgery,
      needNurseReview: hasHighRisk
    })

    const queueData = generateQueueInfo(hasHighRisk)
    setQueueInfo(queueData)
    setCurrentStep(5)

    console.log('[Risk] 生成排队信息:', queueData)

    if (hasHighRisk) {
      const riskSummary = getRiskSummaryText()
      Taro.showModal({
        title: '需要护士复核',
        content: `根据您填写的情况（${riskSummary}），为了确保您的安全，我们需要先安排护士与您进行当面复核确认。请您在座位上稍候，护士会很快过来与您沟通。`,
        showCancel: false,
        confirmText: '我知道了',
        success: () => {
          Taro.switchTab({
            url: '/pages/queue/index'
          })
        }
      })
    } else {
      Taro.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/queue/index'
        })
      }, 1500)
    }
  }

  const handlePrev = () => {
    Taro.navigateBack()
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>健康状况确认</Text>
        <Text className={styles.subtitle}>请如实填写，这对您的安全很重要</Text>
      </View>

      <View className={styles.warningBanner}>
        <Text className={styles.warningIcon}>⚠️</Text>
        <View className={styles.warningContent}>
          <Text className={styles.warningTitle}>重要提醒</Text>
          <Text className={styles.warningText}>
            为了确保您的安全和治疗效果，请务必如实填写以下信息。如有隐瞒，可能会影响治疗效果或增加风险。
          </Text>
        </View>
      </View>

      <View className={styles.questionSection}>
        <Text className={styles.sectionTitle}>健康状况自查</Text>
        {riskQuestions.map(question => (
          <View key={question.id} className={styles.questionItem}>
            <Text className={styles.questionText}>
              {question.question}
              <Text className={classnames(styles.riskTag, styles[question.riskLevel])}>
                {question.riskLevel === 'high' && '高风险'}
                {question.riskLevel === 'medium' && '需注意'}
                {question.riskLevel === 'low' && '一般'}
              </Text>
            </Text>
            <Text className={styles.questionTip}>{question.tip}</Text>
            <View className={styles.answerOptions}>
              <View
                className={classnames(styles.answerOption, {
                  [styles.selectedYes]: answers[question.id] === true
                })}
                onClick={() => handleAnswer(question.id, true)}
              >
                <Text className={styles.answerText}>是</Text>
              </View>
              <View
                className={classnames(styles.answerOption, {
                  [styles.selectedNo]: answers[question.id] === false
                })}
                onClick={() => handleAnswer(question.id, false)}
              >
                <Text className={styles.answerText}>否</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.uploadSection}>
        <Text className={styles.uploadTitle}>面诊资料上传（选填）</Text>
        <Text className={styles.uploadDesc}>
          如有之前的检查报告或面部照片，可以上传供医生参考
        </Text>
        <View className={styles.uploadArea}>
          {uploadedFiles.map((file, index) => (
            <View key={index} className={styles.uploadItem}>
              <Image className={styles.uploadedImage} src={file} mode="aspectFill" />
              <View className={styles.removeButton} onClick={() => handleRemoveImage(index)}>
                <Text>×</Text>
              </View>
            </View>
          ))}
          {uploadedFiles.length < 3 && (
            <View className={styles.uploadItem} onClick={handleUpload}>
              <Text className={styles.uploadIcon}>📷</Text>
              <Text className={styles.uploadText}>上传照片</Text>
            </View>
          )}
        </View>
      </View>

      {hasHighRisk && (
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>📋 护士复核提醒</Text>
          <Text className={styles.summaryText}>
            根据您填写的情况（{getRiskSummaryText()}），需要先由护士当面复核确认。请您稍候，护士会很快过来与您沟通。
          </Text>
        </View>
      )}

      <View className={styles.bottomBar}>
        <View className={styles.prevButton} onClick={handlePrev}>
          <Text className={styles.prevButtonText}>上一步</Text>
        </View>
        <View className={styles.submitButton} onClick={handleSubmit}>
          <Text className={styles.submitButtonText}>提交并获取排队号</Text>
        </View>
      </View>
    </View>
  )
}

export default RiskPage
