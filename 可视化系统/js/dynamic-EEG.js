// 初始化 ECharts 实例
const EEGchart = echarts.init(document.getElementById('chart'))

// 通道与分组信息
const channelInfo = [
  { index: 0, name: 'FP1', group: '前额' },
  { index: 1, name: 'FPZ', group: '前额' },
  { index: 2, name: 'FP2', group: '前额' },
  { index: 5, name: 'F7', group: '额叶' },
  { index: 7, name: 'F3', group: '额叶' },
  { index: 9, name: 'FZ', group: '额叶' },
  { index: 11, name: 'F4', group: '额叶' },
  { index: 13, name: 'F8', group: '额叶' },
  { index: 23, name: 'T7', group: '颞叶' },
  { index: 31, name: 'T8', group: '颞叶' },
  { index: 25, name: 'C3', group: '中心部' },
  { index: 27, name: 'CZ', group: '中心部' },
  { index: 29, name: 'C4', group: '中心部' },
  { index: 41, name: 'P7', group: '顶叶' },
  { index: 43, name: 'P3', group: '顶叶' },
  { index: 45, name: 'PZ', group: '顶叶' },
  { index: 47, name: 'P4', group: '顶叶' },
  { index: 49, name: 'P8', group: '顶叶' },
  { index: 58, name: 'O1', group: '枕叶' },
  { index: 59, name: 'O2', group: '枕叶' },
  { index: 60, name: 'O3', group: '枕叶' },
]

// 从分组信息中提取组别
const groups = [...new Set(channelInfo.map((channel) => channel.group))]

// 动态填充下拉框选项
const groupSelector = document.getElementById('groupSelector')
groups.forEach((group) => {
  const option = document.createElement('option')
  option.value = group
  option.textContent = group
  groupSelector.appendChild(option)
})

// 加载脑电数据
fetch('SEED-DV/single-channel/sub1_channel0.json')
  .then((response) => response.json())
  .then((data) => {
    const timeData = Array.from({ length: data[0].length }, (_, i) => i) // 时间轴
    const frameInterval = 5 // 帧间隔
    let timeIndex = 0 // 当前时间索引
    let isPlaying = true // 播放状态

    // 渲染特定组别
    function renderChart(group) {
      const filteredChannels = channelInfo.filter(
        (channel) => channel.group === group,
      )

      // 配置 ECharts
      const option = {
        title: {
          text: `脑区脑电展示: ${group}`,
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
          },
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: 0,
            xAxisIndex: Array.from({ length: 62 }, (_, i) => i), // 应用于所有 x 轴
            start: 0,
            end: 100, // 可调整初始范围
            show: true,
            opacity: 0,
            emphasis: { opacity: 1 },
            blur: { opacity: 0 }, // 失去焦点时回归透明
            backgroundColor: 'rgba(0,0,0,0)',
          },
        ],
        grid: [],
        xAxis: [],
        yAxis: [],
        series: [],
      }

      // 动态设置各组别
      filteredChannels.forEach((channel, idx) => {
        option.grid.push({
          top: `${idx * (100 / filteredChannels.length) + 7}%`,
          height: `${100 / filteredChannels.length - 12}%`,
          left: '2%',
          right: '2%',
        })

        option.xAxis.push({
          type: 'category',
          data: timeData.slice(0, timeIndex),
          gridIndex: idx,
          boundaryGap: false,
          axisLabel: {
            show: idx === filteredChannels.length - 1,
          },
          axisTick: { show: false },
        })

        option.yAxis.push({
          type: 'value',
          gridIndex: idx,
          name: channel.name,
          position: 'left',
          splitLine: {
            show: false,
          },
          axisLabel: { show: false },
          axisTick: { show: false },
        })

        option.series.push({
          name: channel.name,
          type: 'line',
          data: data[channel.index].slice(0, timeIndex),
          xAxisIndex: idx,
          yAxisIndex: idx,
          lineStyle: {
            color: 'black',
            width: 1,
          },
          showSymbol: false,
          smooth: true,
        })
      })

      EEGchart.setOption(option, { notMerge: true })
    }

    // 默认加载第一个组别
    renderChart(groups[0])

    // 分组选择事件
    groupSelector.addEventListener('change', (event) => {
      const selectedGroup = event.target.value
      // timeIndex = 0 // 重置时间索引以便重新播放
      renderChart(selectedGroup)
    })

    // 暂停/播放按钮事件
    const playPauseButton = document.getElementById('playPauseButton')
    const video = document.getElementById('origin-video')
    playPauseButton.addEventListener('click', () => {
      isPlaying = !isPlaying
      playPauseButton.textContent = isPlaying ? '暂停' : '播放'
      if (isPlaying) {
        video.play()
      } else {
        video.pause()
      }
    })

    // 动态更新图表
    function updateChart() {
      if (timeIndex < timeData.length && isPlaying) {
        timeIndex++
        const selectedGroup = groupSelector.value
        renderChart(selectedGroup)
      }

      setTimeout(updateChart, frameInterval)
    }

    // 启动更新
    updateChart()
  })
  .catch((error) => {
    console.error('Error loading brain signal data:', error)
  })
