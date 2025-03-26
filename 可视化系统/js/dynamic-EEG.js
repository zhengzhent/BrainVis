// Initialize ECharts instance
const EEGchart = echarts.init(document.getElementById('chart'))
// Channel and group information
const EEGchannelInfo = [
  { index: 0, name: 'FP1', group: 'All Channels' },
  { index: 1, name: 'FPZ', group: 'All Channels' },
  { index: 2, name: 'FP2', group: 'All Channels' },
  { index: 5, name: 'F7', group: 'All Channels' },
  { index: 7, name: 'F3', group: 'All Channels' },
  { index: 9, name: 'FZ', group: 'All Channels' },
  { index: 11, name: 'F4', group: 'All Channels' },
  { index: 13, name: 'F8', group: 'All Channels' },
  { index: 23, name: 'T7', group: 'All Channels' },
  { index: 31, name: 'T8', group: 'All Channels' },
  { index: 25, name: 'C3', group: 'All Channels' },
  { index: 27, name: 'CZ', group: 'All Channels' },
  { index: 29, name: 'C4', group: 'All Channels' },
  { index: 41, name: 'P7', group: 'All Channels' },
  { index: 43, name: 'P3', group: 'All Channels' },
  { index: 45, name: 'PZ', group: 'All Channels' },
  { index: 47, name: 'P4', group: 'All Channels' },
  { index: 49, name: 'P8', group: 'All Channels' },
  { index: 58, name: 'O1', group: 'All Channels' },
  { index: 59, name: 'O2', group: 'All Channels' },
  { index: 60, name: 'O3', group: 'All Channels' },
  { index: 0, name: 'FP1', group: 'Frontal Poles' },
  { index: 1, name: 'FPZ', group: 'Frontal Poles' },
  { index: 2, name: 'FP2', group: 'Frontal Poles' },
  { index: 5, name: 'F7', group: 'Frontal Lobes' },
  { index: 7, name: 'F3', group: 'Frontal Lobes' },
  { index: 9, name: 'FZ', group: 'Frontal Lobes' },
  { index: 11, name: 'F4', group: 'Frontal Lobes' },
  { index: 13, name: 'F8', group: 'Frontal Lobes' },
  { index: 23, name: 'T7', group: 'Temporal Lobes' },
  { index: 31, name: 'T8', group: 'Temporal Lobes' },
  { index: 25, name: 'C3', group: 'Central' },
  { index: 27, name: 'CZ', group: 'Central' },
  { index: 29, name: 'C4', group: 'Central' },
  { index: 41, name: 'P7', group: 'Parietal Lobes' },
  { index: 43, name: 'P3', group: 'Parietal Lobes' },
  { index: 45, name: 'PZ', group: 'Parietal Lobes' },
  { index: 47, name: 'P4', group: 'Parietal Lobes' },
  { index: 49, name: 'P8', group: 'Parietal Lobes' },
  { index: 58, name: 'O1', group: 'Occipital Lobes' },
  { index: 59, name: 'O2', group: 'Occipital Lobes' },
  { index: 60, name: 'O3', group: 'Occipital Lobes' },
  // -------------------------------------
]

// Add color array
const EEGcolors = [
  // '#FF6B6B', // Rose Red
  // '#4ECDC4', // Cyan
  // '#45B7D1', // Sky Blue
  // '#96CEB4', // Light Green
  // '#FFEEAD', // Light Yellow
  // '#D39BCA', // Purple
  // '#8C8C8C', // Gray
  // '#85C1E9', // Teal
  // '#9B9B9B', // Medium Gray
  // '#E67E22', // Orange
  // '#B34747', // Dark Red
  // '#8E44AD', // Violet
  // '#2980B9', // Dark Blue
  // '#27AE60', // Dark Green
  // '#F39C12', // Orange Red
  // '#E74C3C', // Red
  // '#3498DB', // Blue
  // '#1ABC9C', // Bright Green
  // '#F1C40F', // Yellow
  // '#95A5A6', // Ash Gray

  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
  '#000000', // Black
]

// Load EEG data
fetch('SEED-DV/single-channel/sub1_channel0.json')
  .then((response) => response.json())
  .then((data) => {
    const timeData = Array.from({ length: data[0].length }, (_, i) => i) // Time axis
    let timeIndex = 0 // Current time index
    let isPlaying = false // Play state
    const totalDuration = 520000 // 13 seconds to complete playback
    const totalPoints = 104000 // Total data points
    let startTime = null // Delay initialization
    let accumulatedTime = 0 // Accumulated playback time

    function renderChart(group) {
      const filteredChannels = EEGchannelInfo.filter(
        (channel) => channel.group === group,
      )

      // Configure ECharts
      const option = {
        // title: {
        //   text: `${group}`,
        //   left: 'center',
        // },
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
          top: `${idx * (100 / filteredChannels.length) + 5}%`,
          height: `${100 / filteredChannels.length - 10}%`,
          left: '2.5%',
          right: '1%',
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
          nameLocation: 'middle',
          nameRotate: 0, // 顺时针旋转90°
          nameGap: 25,
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
            width: 1,
          },
          showSymbol: false,
          smooth: true,
        })
      })

      EEGchart.setOption(option, { notMerge: true })

      // Add click event: jump to corresponding video time and pause
      EEGchart.getZr().off('click')
      EEGchart.getZr().on('click', function (event) {
        const pointInPixel = [event.offsetX, event.offsetY]
        const pointInGrid = EEGchart.convertFromPixel(
          { seriesIndex: 0 },
          pointInPixel,
        )

        if (pointInGrid) {
          const clickedIndex = Math.round(pointInGrid[0])
          const clickedTime = clickedIndex / 200 // Calculate time based on sampling frequency 200Hz
          console.log('clickedIndex:', clickedIndex)
          console.log('clickedTime:', clickedTime)

          // Jump to corresponding video time and pause
          video.currentTime = clickedTime
          accumulatedTime = clickedTime * 1000
          console.log('accumulatedTime:', accumulatedTime)
          timeIndex = clickedIndex

          // Stop playback, keep EEG chart static
          isPlaying = false
          playPauseButton.textContent = 'Play'
          video.pause()

          displayFiveFramesAtTime(clickedTime)
        }
      })
    }

    // Default load first group - Frontal
    renderChart('All Channels')

    // Group button click event
    const buttons = document.querySelectorAll('.group-button')
    buttons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const selectedGroup = event.target.dataset.group
        renderChart(selectedGroup)
      })
    })

    // Pause/Play button event
    const playPauseButton = document.getElementById('playPauseButton')
    const video = document.getElementById('origin-video')
    playPauseButton.addEventListener('click', () => {
      // If already finished playing, do not replay on next click
      if (timeIndex >= totalPoints) {
        return
      }

      isPlaying = !isPlaying
      playPauseButton.textContent = isPlaying ? 'Pause' : 'Play'

      if (isPlaying) {
        video.play()
        startTime = performance.now() - accumulatedTime // Start playing from current accumulated time
      } else {
        video.pause()
      }
    })

    function updateChart() {
      if (isPlaying) {
        const currentTime = performance.now()
        const elapsedTime = currentTime - startTime

        // Calculate current data points to display based on total time
        timeIndex = Math.floor((elapsedTime / totalDuration) * totalPoints)

        // Ensure not to exceed data length
        if (timeIndex >= totalPoints) {
          timeIndex = totalPoints
          isPlaying = false
          playPauseButton.textContent = 'Play'
          video.pause()
        }

        // Update chart
        const activeButton = document.querySelector('.group-button.active')
        const selectedGroup = activeButton
          ? activeButton.dataset.group
          : 'All Channels'
        renderChart(selectedGroup)
      }

      requestAnimationFrame(updateChart)
    }

    updateChart()
  })
  .catch((error) => {
    console.error('Error loading brain signal data:', error)
  })
