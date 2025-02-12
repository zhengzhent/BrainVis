const chart = echarts.init(document.querySelector('.chart_5'))
let currentData = null
let timeIndex = 0
let intervalId = null
let isPlaying = true
const numChannels = 21
const frameInterval = 5

// 定义21种优雅的颜色
const colors = [
  '#FF6B6B', // 玫瑰红
  '#4ECDC4', // 青色
  '#45B7D1', // 天蓝色
  '#96CEB4', // 淡绿色
  '#FFEEAD', // 淡黄色
  '#D39BCA', // 紫色
  '#8C8C8C', // 灰色
  '#FFD93D', // 柠檬黄
  '#85C1E9', // 蓝绿色
  '#9B9B9B', // 中灰
  '#E67E22', // 橙色
  '#B34747', // 深红色
  '#8E44AD', // 紫罗兰
  '#2980B9', // 深蓝色
  '#27AE60', // 深绿色
  '#F39C12', // 橙红色
  '#E74C3C', // 红色
  '#3498DB', // 蓝色
  '#1ABC9C', // 鲜绿色
  '#F1C40F', // 黄色
  '#95A5A6', // 烟灰色
]

// 添加channelInfo数组
const channelInfo = [
  { index: 0, name: 'FP1', group: '前额' },
  { index: 1, name: 'FPZ', group: '前额' },
  { index: 2, name: 'FP2', group: '前额' },
  { index: 3, name: 'F7', group: '额叶' },
  { index: 4, name: 'F3', group: '额叶' },
  { index: 5, name: 'FZ', group: '额叶' },
  { index: 6, name: 'F4', group: '额叶' },
  { index: 7, name: 'F8', group: '额叶' },
  { index: 8, name: 'T7', group: '颞叶' },
  { index: 9, name: 'T8', group: '颞叶' },
  { index: 10, name: 'C3', group: '中心部' },
  { index: 11, name: 'CZ', group: '中心部' },
  { index: 12, name: 'C4', group: '中心部' },
  { index: 13, name: 'P7', group: '顶叶' },
  { index: 14, name: 'P3', group: '顶叶' },
  { index: 15, name: 'PZ', group: '顶叶' },
  { index: 16, name: 'P4', group: '顶叶' },
  { index: 17, name: 'P8', group: '顶叶' },
  { index: 18, name: 'O1', group: '枕叶' },
  { index: 19, name: 'O2', group: '枕叶' },
  { index: 20, name: 'O3', group: '枕叶' },
]

// 初始配置
const option = {
  title: { text: '选择频段查看数据', left: 'center' },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      let content = `时间: ${params[0].name}<br/>`
      params.forEach((param) => {
        content += `${param.seriesName}:  ${param.value}<br/>`
      })
      return content
    },
  },
  grid: {
    left: '4%',
    right: '5%',
    top: '15%',
    bottom: '15%',
    containLabel: true,
  },
  dataZoom: [
    { type: 'slider', xAxisIndex: 0, start: 0, end: 100 },
    { type: 'inside', xAxisIndex: 0 },
  ],
  xAxis: {
    type: 'category',
    name: '时间 (ms)',
    nameLocation: 'middle', // 标题位置：'start'（左）, 'middle'（中）, 'end'（右）
    nameGap: 10, // 标题与轴线之间的距离，可以调整这个值
    nameTextStyle: {
      // 标题文字样式
      padding: [10, 0, 0, 0], // 上右下左的内边距
    },
    data: [],
  },
  yAxis: { type: 'value', name: '电压 (μV)', splitLine: { show: false } },
  series: [],
}

chart.setOption(option)

// 加载数据并初始化图表
function loadData(band) {
  clearInterval(intervalId)
  isPlaying = false
  timeIndex = 0

  option.title.text = `${band} 频段脑电波`
  option.xAxis.data = []
  option.series = []
  chart.clear()

  // 获取当前选择的脑区
  const selectedRegion = document.getElementById('regionSelect').value

  // 筛选需要显示的通道
  const displayChannels =
    selectedRegion === 'all'
      ? channelInfo
      : channelInfo.filter((channel) => channel.group === selectedRegion)

  // 只为选中脑区的通道创建数据系列
  displayChannels.forEach((channel) => {
    option.series.push({
      name: `${channel.name} (${channel.group})`,
      type: 'line',
      data: [],
      lineStyle: {
        color: colors[channel.index],
        width: 1.5,
      },
      showSymbol: false,
      smooth: true,
    })
  })

  fetch(`data/${band}.json`)
    .then((response) => response.json())
    .then((data) => {
      currentData = data
      chart.setOption(option)
      document
        .querySelectorAll('.band-btn')
        .forEach((btn) => btn.classList.remove('active'))
      document.querySelector(`[data-band="${band}"]`).classList.add('active')
    })
    .catch((error) => {
      console.error('加载数据失败:', error)
      console.error(`尝试加载的文件路径: data/${band}.json`)
    })
}

// 动态更新图表
function updateChart() {
  if (!currentData || timeIndex >= currentData[0].length) return

  if (isPlaying) {
    const timeData = Array.from({ length: currentData[0].length }, (_, i) => i)
    const nextTime = timeData[timeIndex]
    const selectedRegion = document.getElementById('regionSelect').value

    option.xAxis.data.push(nextTime)

    const displayChannels =
      selectedRegion === 'all'
        ? channelInfo
        : channelInfo.filter((channel) => channel.group === selectedRegion)

    displayChannels.forEach((channel, index) => {
      option.series[index].data.push(currentData[channel.index][timeIndex])
    })

    chart.setOption(option)
    timeIndex++
  }
}

// 按钮事件绑定
document.querySelectorAll('.band-btn').forEach((button) => {
  button.addEventListener('click', () => {
    loadData(button.dataset.band)
  })
})

document.getElementById('playButton_5').addEventListener('click', () => {
  if (!isPlaying) {
    isPlaying = true
    intervalId = setInterval(updateChart, frameInterval)
  }
})

document.getElementById('pauseButton_5').addEventListener('click', () => {
  isPlaying = false
  clearInterval(intervalId)
})

// 添加区域选择事件监听
document.getElementById('regionSelect').addEventListener('change', () => {
  const currentBand = document.querySelector('.band-btn.active').dataset.band
  loadData(currentBand)
})

// 默认加载Beta数据
loadData('Beta')
