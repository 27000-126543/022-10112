export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/queue/index',
    'pages/mine/index',
    'pages/privacy/index',
    'pages/consultation/index',
    'pages/risk/index',
    'pages/navigation/index',
    'pages/board/index',
    'pages/nurse/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '医美导诊',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFF5F7'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B9D',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '到院签到'
      },
      {
        pagePath: 'pages/queue/index',
        text: '排队进度'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
