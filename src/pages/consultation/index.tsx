import React, { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useConsultationStore } from '@/store/consultation'
import { concernOptions, budgetOptions, improvementAreas } from '@/data/mock'
import StepIndicator from '@/components/StepIndicator'
import styles from './index.module.scss'

const steps = ['基本信息', '想改善什么', '预算范围', '部位选择']

const ConsultationPage: React.FC = () => {
  const { consultationData, setConsultationData, setCurrentStep, currentStep } = useConsultationStore()
  const [step, setStep] = useState(0)

  const [basicInfo, setBasicInfo] = useState({
    name: consultationData.basicInfo.name,
    phone: consultationData.basicInfo.phone,
    age: consultationData.basicInfo.age,
    gender: consultationData.basicInfo.gender
  })

  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(consultationData.concerns)
  const [selectedBudget, setSelectedBudget] = useState(consultationData.budget)
  const [selectedAreas, setSelectedAreas] = useState<string[]>(consultationData.improvements)
  const [inputFocused, setInputFocused] = useState<string | null>(null)

  const handleToggleConcern = (id: string) => {
    setSelectedConcerns(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleToggleArea = (id: string) => {
    setSelectedAreas(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const canProceed = () => {
    switch (step) {
      case 0:
        return basicInfo.name && basicInfo.phone && basicInfo.age && basicInfo.gender
      case 1:
        return selectedConcerns.length > 0
      case 2:
        return !!selectedBudget
      case 3:
        return selectedAreas.length > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
      setCurrentStep(step + 1)
      console.log('[Consultation] 进入步骤', step + 1)
    } else {
      saveDataAndNext()
    }
  }

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1)
      setCurrentStep(step - 1)
    } else {
      Taro.navigateBack()
    }
  }

  const saveDataAndNext = () => {
    setConsultationData({
      basicInfo,
      concerns: selectedConcerns,
      budget: selectedBudget,
      improvements: selectedAreas
    })

    console.log('[Consultation] 诉求信息已保存:', {
      basicInfo,
      concerns: selectedConcerns,
      budget: selectedBudget,
      improvements: selectedAreas
    })

    Taro.navigateTo({
      url: '/pages/risk/index'
    })
  }

  const renderStep0 = () => (
    <View>
      <View className={styles.questionCard}>
        <Text className={styles.questionIcon}>💬</Text>
        <Text className={styles.questionText}>
          先了解一下您的基本信息吧，这些信息会帮助我们为您提供更贴心的服务
        </Text>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>您的称呼</Text>
          <Input
            className={classnames(styles.formInput, { [styles.focused]: inputFocused === 'name' })}
            placeholder="请输入您的姓名或昵称"
            placeholderClass="input-placeholder"
            value={basicInfo.name}
            onInput={(e) => setBasicInfo({ ...basicInfo, name: e.detail.value })}
            onFocus={() => setInputFocused('name')}
            onBlur={() => setInputFocused(null)}
            maxlength={20}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>手机号码</Text>
          <Input
            className={classnames(styles.formInput, { [styles.focused]: inputFocused === 'phone' })}
            placeholder="请输入您的手机号"
            placeholderClass="input-placeholder"
            type="number"
            value={basicInfo.phone}
            onInput={(e) => setBasicInfo({ ...basicInfo, phone: e.detail.value })}
            onFocus={() => setInputFocused('phone')}
            onBlur={() => setInputFocused(null)}
            maxlength={11}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>年龄</Text>
          <Input
            className={classnames(styles.formInput, { [styles.focused]: inputFocused === 'age' })}
            placeholder="请输入您的年龄"
            placeholderClass="input-placeholder"
            type="number"
            value={basicInfo.age}
            onInput={(e) => setBasicInfo({ ...basicInfo, age: e.detail.value })}
            onFocus={() => setInputFocused('age')}
            onBlur={() => setInputFocused(null)}
            maxlength={3}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>性别</Text>
          <View className={styles.genderOptions}>
            <View
              className={classnames(styles.genderOption, { [styles.selected]: basicInfo.gender === 'female' })}
              onClick={() => setBasicInfo({ ...basicInfo, gender: 'female' })}
            >
              <Text className={styles.genderText}>👩 女性</Text>
            </View>
            <View
              className={classnames(styles.genderOption, { [styles.selected]: basicInfo.gender === 'male' })}
              onClick={() => setBasicInfo({ ...basicInfo, gender: 'male' })}
            >
              <Text className={styles.genderText}>👨 男性</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )

  const renderStep1 = () => (
    <View>
      <View className={styles.questionCard}>
        <Text className={styles.questionIcon}>🤔</Text>
        <Text className={styles.questionText}>
          您主要想改善哪些方面的问题呢？可以多选哦，选最让您在意的就好
        </Text>
      </View>

      <ScrollView scrollY className={styles.optionsList}>
        {concernOptions.map(option => (
          <View
            key={option.id}
            className={classnames(styles.optionCard, {
              [styles.selected]: selectedConcerns.includes(option.id)
            })}
            onClick={() => handleToggleConcern(option.id)}
          >
            <Text className={styles.optionIcon}>
              {option.id === 'acne' && '🔴'}
              {option.id === 'wrinkle' && '〰️'}
              {option.id === 'nose' && '👃'}
              {option.id === 'contour' && '😌'}
              {option.id === 'hair' && '✨'}
              {option.id === 'spots' && '🌟'}
              {option.id === 'eyes' && '👁️'}
              {option.id === 'lips' && '👄'}
              {option.id === 'skin' && '💆'}
              {option.id === 'other' && '❓'}
            </Text>
            <View className={styles.optionContent}>
              <Text className={styles.optionTitle}>{option.label}</Text>
              <Text className={styles.optionDesc}>{option.description}</Text>
            </View>
            <View className={styles.optionCheck}>
              {selectedConcerns.includes(option.id) && (
                <Text className={styles.checkIcon}>✓</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View className={styles.selectedCount}>
        已选择 <Text className={styles.countHighlight}>{selectedConcerns.length}</Text> 项
      </View>
    </View>
  )

  const renderStep2 = () => (
    <View>
      <View className={styles.questionCard}>
        <Text className={styles.questionIcon}>💰</Text>
        <Text className={styles.questionText}>
          大概的预算范围是多少呢？这会帮助我们为您推荐更合适的方案
        </Text>
      </View>

      <View className={styles.budgetOptions}>
        {budgetOptions.map(option => (
          <View
            key={option.id}
            className={classnames(styles.budgetCard, {
              [styles.selected]: selectedBudget === option.id
            })}
            onClick={() => setSelectedBudget(option.id)}
          >
            <Text className={styles.budgetIcon}>💵</Text>
            <View className={styles.budgetContent}>
              <Text className={styles.budgetAmount}>{option.label}</Text>
              <Text className={styles.budgetDesc}>{option.description}</Text>
            </View>
            <View className={styles.budgetRadio} />
          </View>
        ))}
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View>
      <View className={styles.questionCard}>
        <Text className={styles.questionIcon}>📍</Text>
        <Text className={styles.questionText}>
          您最想改善哪些部位呢？点选您在意的部位就好
        </Text>
      </View>

      <View className={styles.faceDiagram}>
        <View className={styles.faceImage}>
          <Text className={styles.faceIcon}>😊</Text>
        </View>
        <View className={styles.areaTags}>
          {improvementAreas.map(area => (
            <View
              key={area.id}
              className={classnames(styles.areaTag, {
                [styles.selected]: selectedAreas.includes(area.id)
              })}
              onClick={() => handleToggleArea(area.id)}
            >
              <Text>{area.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.selectedCount}>
        已选择 <Text className={styles.countHighlight}>{selectedAreas.length}</Text> 个部位
      </View>
    </View>
  )

  return (
    <View className={styles.pageContainer}>
      <View className={styles.stepIndicator}>
        <StepIndicator steps={steps} currentStep={step} />
      </View>

      <View className={styles.stepHeader}>
        <Text className={styles.stepTitle}>
          {step === 0 && '先认识一下您'}
          {step === 1 && '想改善什么问题'}
          {step === 2 && '预算范围大概是'}
          {step === 3 && '想改善哪些部位'}
        </Text>
        <Text className={styles.stepDesc}>
          第 {step + 1} 步，共 {steps.length} 步
        </Text>
      </View>

      <ScrollView scrollY>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.prevButton} onClick={handlePrev}>
          <Text className={styles.prevButtonText}>
            {step === 0 ? '取消' : '上一步'}
          </Text>
        </View>
        <View
          className={classnames(styles.nextButton, {
            [styles.disabled]: !canProceed()
          })}
          onClick={handleNext}
        >
          <Text className={styles.nextButtonText}>
            {step === steps.length - 1 ? '下一步' : '下一步'}
          </Text>
          <Text className={styles.nextButtonText}>›</Text>
        </View>
      </View>
    </View>
  )
}

export default ConsultationPage
