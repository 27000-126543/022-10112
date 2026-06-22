import React from 'react'
import { Button, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface GradientButtonProps {
  text: string
  onClick?: () => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  block?: boolean
  variant?: 'primary' | 'outline' | 'ghost'
}

const GradientButton: React.FC<GradientButtonProps> = ({
  text,
  onClick,
  disabled = false,
  size = 'medium',
  block = false,
  variant = 'primary'
}) => {
  return (
    <Button
      className={classnames(
        styles.gradientButton,
        styles[size],
        styles[variant],
        {
          [styles.block]: block,
          [styles.disabled]: disabled
        }
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Text className={styles.buttonText}>{text}</Text>
    </Button>
  )
}

export default GradientButton
