import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <View className={styles.stepContainer}>
      {steps.map((step, index) => (
        <View key={index} className={styles.stepItem}>
          <View
            className={classnames(styles.stepCircle, {
              [styles.completed]: index < currentStep,
              [styles.current]: index === currentStep
            })}
          >
            {index < currentStep ? (
              <Text className={styles.checkIcon}>✓</Text>
            ) : (
              <Text className={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>
          <Text
            className={classnames(styles.stepLabel, {
              [styles.activeLabel]: index <= currentStep
            })}
          >
            {step}
          </Text>
          {index < steps.length - 1 && (
            <View
              className={classnames(styles.stepLine, {
                [styles.lineCompleted]: index < currentStep
              })}
            />
          )}
        </View>
      ))}
    </View>
  )
}

export default StepIndicator
