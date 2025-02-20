// 初始化 ECharts 实例
const allEEGChart = echarts.init(document.getElementById('all-channel'))

// EEG通道信息
const EEGchannelInfo_all_channel = [
  { index: 0, name: 'FP1' },
  { index: 1, name: 'FPZ' },
  { index: 2, name: 'FP2' },
  { index: 5, name: 'F7' },
  { index: 7, name: 'F3' },
  { index: 9, name: 'FZ' },
  { index: 11, name: 'F4' },
  { index: 13, name: 'F8' },
  { index: 23, name: 'T7' },
  { index: 31, name: 'T8' },
  { index: 25, name: 'C3' },
  { index: 27, name: 'CZ' },
  { index: 29, name: 'C4' },
  { index: 41, name: 'P7' },
  { index: 43, name: 'P3' },
  { index: 45, name: 'PZ' },
  { index: 47, name: 'P4' },
  { index: 49, name: 'P8' },
  { index: 58, name: 'O1' },
  { index: 59, name: 'O2' },
  { index: 60, name: 'O3' },
]

// 颜色数组
const EEGcolors_all_channel = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEEAD',
  '#D39BCA',
  '#8C8C8C',
  '#85C1E9',
  '#9B9B9B',
  '#E67E22',
  '#B34747',
  '#8E44AD',
  '#2980B9',
  '#27AE60',
  '#F39C12',
  '#E74C3C',
  '#3498DB',
  '#1ABC9C',
  '#F1C40F',
  '#95A5A6',
]

// 加载脑电数据
fetch('SEED-DV/single-channel/testData/testEEG.json')
  .then((response) => response.json())
  .then((data) => {
    const timeData = Array.from({ length: data[0].length }, (_, i) => i)
    let timeIndex = 0 // 当前时间索引
    let isPlaying = false
    const totalDuration = 13000 // 13 秒
    const totalPoints = 2600 // 数据总点数
    let startTime = null
    let accumulatedTime = 0

    function renderAllChannels() {
      const option = {
        title: { text: ' ', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: Array.from(
              { length: EEGchannelInfo_all_channel.length },
              (_, i) => i,
            ),
            start: 0,
            end: 100,
            show: true,
            opacity: 0,
            emphasis: { opacity: 1 },
            blur: { opacity: 0 },
          },
        ],
        grid: [],
        xAxis: [],
        yAxis: [],
        series: [],
      }

      EEGchannelInfo_all_channel.forEach((channel, idx) => {
        option.grid.push({
          top: `${idx * (100 / EEGchannelInfo_all_channel.length) + 5}%`,
          height: `${100 / EEGchannelInfo_all_channel.length - 10}%`,
          left: '2%',
          right: '2%',
        })

        option.xAxis.push({
          type: 'category',
          data: timeData.slice(0, timeIndex),
          gridIndex: idx,
          boundaryGap: false,
          axisLabel: { show: idx === EEGchannelInfo_all_channel.length - 1 },
          axisTick: { show: false },
        })

        option.yAxis.push({
          type: 'value',
          gridIndex: idx,
          name: channel.name,
          position: 'left',
          splitLine: { show: false },
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
            color:
              EEGcolors_all_channel[
                channel.index % EEGcolors_all_channel.length
              ],
            width: 2,
          },
          showSymbol: false,
          smooth: true,
        })
      })

      allEEGChart.setOption(option, { notMerge: true })

      //   allEEGChart.getZr().on('click', function (event) {
      //     const pointInPixel = [event.offsetX, event.offsetY]
      //     const pointInGrid = allEEGChart.convertFromPixel(
      //       { seriesIndex: 0 },
      //       pointInPixel,
      //     )

      //     if (pointInGrid) {
      //       const clickedIndex = Math.round(pointInGrid[0])
      //       const clickedTime = clickedIndex / 200 // 根据采样频率 200Hz 计算时间
      //       console.log('clickedIndex:', clickedIndex) // 打印 clickedIndex 的值
      //       console.log('clickedTime:', clickedTime) // 打印 clickedTime 的值

      //       // 跳转到对应视频时间并暂停
      //       video.currentTime = clickedTime
      //       accumulatedTime = clickedTime * 1000
      //       console.log('accumulatedTime:', accumulatedTime) // 打印 accumulatedTime 的值
      //       timeIndex = clickedIndex

      //       // 停止播放，保持 EEG 图静止
      //       isPlaying = false
      //       playPauseButton.textContent = '播放'
      //       video.pause()

      //       // **调用 displayFiveFramesAtTime() 显示前中后五帧**
      //       displayFiveFramesAtTime(clickedTime)
      //     }
      //   })
    }

    renderAllChannels()

    // 播放/暂停按钮
    const playPauseButton = document.getElementById('playPauseButton')
    const video = document.getElementById('origin-video')

    playPauseButton.addEventListener('click', () => {
      if (timeIndex >= totalPoints) return

      isPlaying = !isPlaying
      playPauseButton.textContent = isPlaying ? '暂停' : '播放'

      if (isPlaying) {
        video.play()
        startTime = performance.now()
      } else {
        video.pause()
        accumulatedTime += performance.now() - startTime
        startTime = null
      }
    })

    function updateChart() {
      if (isPlaying) {
        const currentTime = performance.now()
        const elapsedTime = accumulatedTime + (currentTime - startTime)

        timeIndex = Math.floor((elapsedTime / totalDuration) * totalPoints)

        if (timeIndex >= totalPoints) {
          timeIndex = totalPoints
          isPlaying = false
          playPauseButton.textContent = '播放'
          video.pause()
        }

        renderAllChannels()
      }

      requestAnimationFrame(updateChart)
    }

    updateChart()
  })
  .catch((error) => {
    console.error('Error loading EEG data:', error)
  })
