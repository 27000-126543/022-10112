import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface OptionCardProps {
  title: string
  description?: string
  selected?: boolean
  onClick?: () => void
  icon?: string
  variant?: 'default' | 'outline'
}

const OptionCard: React.FC<OptionCardProps> = ({
  title,
  description,
  selected = false,
  onClick,
  icon,
  variant = 'default'
}) => {
  return (
    <View
      className={classnames(styles.optionCard, {
        [styles.selected]: selected,
        [styles.outline]: variant === 'outline'
      })}
      onClick={onClick}
    >
      {icon && <Text className={styles.cardIcon}>{icon}</Text>}
      <View className={styles.cardContent}>
        <Text className={styles.cardTitle}>{title}</Text>
        {description && (
          <Text className={styles.cardDescription}>{description}</Text>
        )}
      </View>
      <View className={classnames(styles.checkbox, { [styles.checked]: selected })}>
        {selected && <Text className={styles.checkIcon}>✓</Text>}
      </View>
    </View>
  )
}

export default OptionCard
