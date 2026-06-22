import { OptionItem, QueueInfo } from '@/types'

export const concernOptions: OptionItem[] = [
  { id: 'acne', label: '痘痘痘印', description: '想改善痘痘、痘印、痘坑问题' },
  { id: 'wrinkle', label: '皱纹松弛', description: '想改善细纹、皱纹、皮肤松弛' },
  { id: 'nose', label: '鼻部形态', description: '对鼻子形状不满意' },
  { id: 'contour', label: '脸部轮廓', description: '想调整脸型、下颌线' },
  { id: 'hair', label: '脱毛嫩肤', description: '想脱毛、改善肤质' },
  { id: 'spots', label: '色斑暗沉', description: '想祛斑、提亮肤色' },
  { id: 'eyes', label: '眼部改善', description: '想改善眼袋、黑眼圈、双眼皮' },
  { id: 'lips', label: '唇部塑形', description: '想改善唇形、丰唇' },
  { id: 'skin', label: '皮肤紧致', description: '想让皮肤更紧致有弹性' },
  { id: 'other', label: '其他问题', description: '有其他想改善的问题' }
]

export const budgetOptions: OptionItem[] = [
  { id: 'budget1', label: '5000元以下', description: '初次尝试，预算有限' },
  { id: 'budget2', label: '5000-10000元', description: '适中预算' },
  { id: 'budget3', label: '1-3万元', description: '有一定预算' },
  { id: 'budget4', label: '3-5万元', description: '预算充足' },
  { id: 'budget5', label: '5万元以上', description: '不设上限，追求效果' }
]

export const improvementAreas: OptionItem[] = [
  { id: 'forehead', label: '额头' },
  { id: 'eyebrow', label: '眉部' },
  { id: 'eyes', label: '眼部' },
  { id: 'nose', label: '鼻子' },
  { id: 'cheeks', label: '苹果肌' },
  { id: 'nasolabial', label: '法令纹' },
  { id: 'lips', label: '嘴唇' },
  { id: 'chin', label: '下巴' },
  { id: 'jaw', label: '下颌线' },
  { id: 'neck', label: '颈部' }
]

export const riskQuestions = [
  {
    id: 'pregnant',
    question: '您目前是否怀孕或处于备孕期？',
    tip: '孕期和备孕期不建议进行医美项目',
    riskLevel: 'high'
  },
  {
    id: 'breastfeeding',
    question: '您是否处于哺乳期？',
    tip: '哺乳期部分项目需要暂缓',
    riskLevel: 'medium'
  },
  {
    id: 'allergy',
    question: '您是否有药物或化妆品过敏史？',
    tip: '过敏体质需要特别注意产品选择',
    riskLevel: 'medium'
  },
  {
    id: 'scar',
    question: '您是否是疤痕体质？',
    tip: '疤痕体质部分项目需谨慎',
    riskLevel: 'high'
  },
  {
    id: 'disease',
    question: '您是否有高血压、糖尿病等慢性疾病？',
    tip: '慢性疾病患者需评估项目风险',
    riskLevel: 'medium'
  },
  {
    id: 'surgery',
    question: '近半年内是否做过其他医美手术？',
    tip: '频繁医美可能增加皮肤负担',
    riskLevel: 'low'
  }
]

export const mockQueueInfo: QueueInfo = {
  queueNumber: 'A023',
  waitTime: 25,
  consultantName: '李医生',
  consultantAvatar: 'https://picsum.photos/id/64/200/200',
  roomNumber: '305诊室',
  floor: '3楼',
  status: 'waiting',
  needNurseReview: false,
  estimatedTime: '15:30'
}

export const consultants = [
  {
    id: '1',
    name: '李医生',
    title: '资深皮肤科医师',
    specialty: '皮肤美容、抗衰紧致',
    avatar: 'https://picsum.photos/id/64/200/200'
  },
  {
    id: '2',
    name: '王医生',
    title: '微整形专家',
    specialty: '面部精雕、注射美容',
    avatar: 'https://picsum.photos/id/91/200/200'
  },
  {
    id: '3',
    name: '张医生',
    title: '整形外科医师',
    specialty: '五官整形、形体雕塑',
    avatar: 'https://picsum.photos/id/177/200/200'
  }
]

export const navigationFloors = [
  {
    floor: '1楼',
    description: '前台接待、等候大厅',
    rooms: ['前台', '咨询台', '休息区']
  },
  {
    floor: '2楼',
    description: '皮肤护理、检测中心',
    rooms: ['皮肤检测室', '护理室', '光子治疗室']
  },
  {
    floor: '3楼',
    description: '咨询诊室、微整形中心',
    rooms: ['301诊室', '302诊室', '303诊室', '305诊室', '注射室']
  },
  {
    floor: '4楼',
    description: '手术中心、术后恢复',
    rooms: ['手术室1', '手术室2', '恢复室']
  }
]
