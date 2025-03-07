// 初始化 ECharts 实例
const EEGchart = echarts.init(document.getElementById('chart'))
// 通道与分组信息
const EEGchannelInfo = [
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
  { index: 0, name: 'FP1', group: '所有通道' },
  { index: 1, name: 'FPZ', group: '所有通道' },
  { index: 2, name: 'FP2', group: '所有通道' },
  { index: 5, name: 'F7', group: '所有通道' },
  { index: 7, name: 'F3', group: '所有通道' },
  { index: 9, name: 'FZ', group: '所有通道' },
  { index: 11, name: 'F4', group: '所有通道' },
  { index: 13, name: 'F8', group: '所有通道' },
  { index: 23, name: 'T7', group: '所有通道' },
  { index: 31, name: 'T8', group: '所有通道' },
  { index: 25, name: 'C3', group: '所有通道' },
  { index: 27, name: 'CZ', group: '所有通道' },
  { index: 29, name: 'C4', group: '所有通道' },
  { index: 41, name: 'P7', group: '所有通道' },
  { index: 43, name: 'P3', group: '所有通道' },
  { index: 45, name: 'PZ', group: '所有通道' },
  { index: 47, name: 'P4', group: '所有通道' },
  { index: 49, name: 'P8', group: '所有通道' },
  { index: 58, name: 'O1', group: '所有通道' },
  { index: 59, name: 'O2', group: '所有通道' },
  { index: 60, name: 'O3', group: '所有通道' },
  // -------------------------------------
]

// 从分组信息中提取组别
const groups = [...new Set(EEGchannelInfo.map((channel) => channel.group))]

// 动态填充下拉框选项
const groupSelector = document.getElementById('groupSelector')
groups.forEach((group) => {
  const option = document.createElement('option')
  option.value = group
  option.textContent = group
  groupSelector.appendChild(option)
})

// 添加颜色数组
const EEGcolors = [
  '#FF6B6B', // 玫瑰红
  '#4ECDC4', // 青色
  '#45B7D1', // 天蓝色
  '#96CEB4', // 淡绿色
  '#FFEEAD', // 淡黄色
  '#D39BCA', // 紫色
  '#8C8C8C', // 灰色
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

// 加载脑电数据
// fetch('SEED-DV/single-channel/testData/testEEG.json') //13s测试数据
fetch('SEED-DV/single-channel/sub1_channel0.json') //完整
  .then((response) => response.json())
  .then((data) => {
    const timeData = Array.from({ length: data[0].length }, (_, i) => i) // 时间轴
    // const frameInterval = 50 // 帧间隔 50ms刷新一次 即1s刷新20次
    // const pointsPerFrame = 10 // 每帧显示的点数  每次刷新10个点 1s刷新200个点 和采样频率一致
    let timeIndex = 0 // 当前时间索引
    let isPlaying = false // 播放状态
    const totalDuration = 130000 // 13 秒播放完毕
    const totalPoints = 26000 // 总数据点数
    let startTime = null // 延迟初始化
    let accumulatedTime = 0 // 累积的播放时间

    function renderChart(group) {
      const filteredChannels = EEGchannelInfo.filter(
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
            xAxisIndex: Array.from(
              { length: filteredChannels.length },
              (_, i) => i,
            ),
            start: 0,
            end: 100,
            show: true,
            opacity: 0,
            emphasis: { opacity: 1 },
            blur: { opacity: 0 },
            backgroundColor: 'rgba(0,0,0,0)',
          },
        ],
        grid: [],
        xAxis: [],
        yAxis: [],
        series: [],
      }

      filteredChannels.forEach((channel, idx) => {
        option.grid.push({
          top: `${idx * (100 / filteredChannels.length) + 7}%`,
          height: `${100 / filteredChannels.length - 12}%`,
          // top: `${idx * (100 / filteredChannels.length) + 10}%`,
          // height: `${100 / filteredChannels.length - 20}%`,
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
            color: EEGcolors[channel.index % EEGcolors.length],
            width: 2,
          },
          showSymbol: false,
          smooth: true,
        })
      })

      EEGchart.setOption(option, { notMerge: true })
      // 添加点击事件：跳转到对应视频时间并暂停
      EEGchart.getZr().off('click')
      // EEGchart.getZr().on('click', function (event) {
      //   const pointInPixel = [event.offsetX, event.offsetY]
      //   const pointInGrid = EEGchart.convertFromPixel(
      //     { seriesIndex: 0 },
      //     pointInPixel,
      //   )

      //   console.log('pointInGrid:', pointInGrid) // 打印 pointInGrid 的值

      //   if (pointInGrid) {
      //     const clickedIndex = Math.round(pointInGrid[0])
      //     console.log('clickedIndex:', clickedIndex) // 打印 clickedIndex 的值

      //     const clickedTime = clickedIndex / 200 // 根据采样频率 200Hz 计算时间
      //     console.log('clickedTime:', clickedTime) // 打印 clickedTime 的值

      //     // 将 clickedTime 对齐到视频的帧时间
      //     const alignedTime =
      //       Math.round(clickedTime / frameInterval) * frameInterval
      //     console.log('alignedTime:', alignedTime) // 打印 alignedTime 的值

      //     // 跳转到对应视频时间并暂停
      //     video.currentTime = alignedTime
      //     accumulatedTime = alignedTime * 1000
      //     console.log('accumulatedTime:', accumulatedTime) // 打印 accumulatedTime 的值
      //     timeIndex = clickedIndex

      //     // 停止播放，保持 EEG 图静止
      //     isPlaying = false
      //     playPauseButton.textContent = '播放'
      //     video.pause()

      //     // 调用 displayFiveFramesAtTime() 显示前中后五帧
      //     displayFiveFramesAtTime(alignedTime)
      //   }
      // })
      EEGchart.getZr().on('click', function (event) {
        const pointInPixel = [event.offsetX, event.offsetY]
        const pointInGrid = EEGchart.convertFromPixel(
          { seriesIndex: 0 },
          pointInPixel,
        )

        if (pointInGrid) {
          const clickedIndex = Math.round(pointInGrid[0])
          const clickedTime = clickedIndex / 200 // 根据采样频率 200Hz 计算时间
          console.log('clickedIndex:', clickedIndex) // 打印 clickedIndex 的值
          console.log('clickedTime:', clickedTime) // 打印 clickedTime 的值

          // 跳转到对应视频时间并暂停
          video.currentTime = clickedTime
          accumulatedTime = clickedTime * 1000
          console.log('accumulatedTime:', accumulatedTime) // 打印 accumulatedTime 的值
          timeIndex = clickedIndex

          // 停止播放，保持 EEG 图静止
          isPlaying = false
          playPauseButton.textContent = '播放'
          video.pause()

          // **调用 displayFiveFramesAtTime() 显示前中后五帧**
          displayFiveFramesAtTime(clickedTime)
        }
      })
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
      // 如果已经播放完毕，再次点击时不重新播放
      if (timeIndex >= totalPoints) {
        return
      }

      isPlaying = !isPlaying
      playPauseButton.textContent = isPlaying ? '暂停' : '播放'

      if (isPlaying) {
        video.play()
        // 继续播放时，不重置 startTime，而是从当前时间继续
        startTime = performance.now()
      } else {
        video.pause()
        // 暂停时，累积已播放的时间
        accumulatedTime += performance.now() - startTime
        startTime = null
      }
    })

    function updateChart() {
      if (isPlaying) {
        const currentTime = performance.now()
        const elapsedTime = accumulatedTime + (currentTime - startTime)

        // 根据总时间计算当前应显示的数据点
        timeIndex = Math.floor((elapsedTime / totalDuration) * totalPoints)

        // 确保不超过数据长度
        if (timeIndex >= totalPoints) {
          timeIndex = totalPoints
          isPlaying = false // 播放结束后停止动画
          playPauseButton.textContent = '播放' // 按钮文字更新
          video.pause() // 同步暂停视频
        }

        // 更新图表
        const selectedGroup = document.getElementById('groupSelector').value
        renderChart(selectedGroup)
      }

      requestAnimationFrame(updateChart)
    }
    //更新
    updateChart()
  })
  .catch((error) => {
    console.error('Error loading brain signal data:', error)
  })
