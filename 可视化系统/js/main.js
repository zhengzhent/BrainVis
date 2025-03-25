// const chart = echarts.init(document.querySelector('.chart_5'))
let currentData = null
let timeIndex = 0
let intervalId = null
let isPlaying = true
const numChannels = 21
const frameInterval = 5

// Define 21 elegant colors
const colors = [
  '#FF6B6B', // Rose Red
  '#4ECDC4', // Cyan
  '#45B7D1', // Sky Blue
  '#96CEB4', // Light Green
  '#FFEEAD', // Light Yellow
  '#D39BCA', // Purple
  '#8C8C8C', // Gray
  '#FFD93D', // Lemon Yellow
  '#85C1E9', // Turquoise
  '#9B9B9B', // Medium Gray
  '#E67E22', // Orange
  '#B34747', // Dark Red
  '#8E44AD', // Violet
  '#2980B9', // Dark Blue
  '#27AE60', // Dark Green
  '#F39C12', // Orange Red
  '#E74C3C', // Red
  '#3498DB', // Blue
  '#1ABC9C', // Bright Green
  '#F1C40F', // Yellow
  '#95A5A6', // Ash Gray
]

// Add channelInfo array
const channelInfo = [
  { index: 0, name: 'FP1', group: 'Frontal' },
  { index: 1, name: 'FPZ', group: 'Frontal' },
  { index: 2, name: 'FP2', group: 'Frontal' },
  { index: 3, name: 'F7', group: 'Frontal Lobe' },
  { index: 4, name: 'F3', group: 'Frontal Lobe' },
  { index: 5, name: 'FZ', group: 'Frontal Lobe' },
  { index: 6, name: 'F4', group: 'Frontal Lobe' },
  { index: 7, name: 'F8', group: 'Frontal Lobe' },
  { index: 8, name: 'T7', group: 'Temporal Lobe' },
  { index: 9, name: 'T8', group: 'Temporal Lobe' },
  { index: 10, name: 'C3', group: 'Central' },
  { index: 11, name: 'CZ', group: 'Central' },
  { index: 12, name: 'C4', group: 'Central' },
  { index: 13, name: 'P7', group: 'Parietal Lobe' },
  { index: 14, name: 'P3', group: 'Parietal Lobe' },
  { index: 15, name: 'PZ', group: 'Parietal Lobe' },
  { index: 16, name: 'P4', group: 'Parietal Lobe' },
  { index: 17, name: 'P8', group: 'Parietal Lobe' },
  { index: 18, name: 'O1', group: 'Occipital Lobe' },
  { index: 19, name: 'O2', group: 'Occipital Lobe' },
  { index: 20, name: 'O3', group: 'Occipital Lobe' },
]

// Initial configuration
const option = {
  title: { text: 'Select Frequency Band to View Data', left: 'center' },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      let content = `Time: ${params[0].name}<br/>`
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
  xAxis: {
    type: 'category',
    name: 'Time (ms)',
    nameLocation: 'middle',
    nameGap: 10,
    nameTextStyle: {
      padding: [10, 0, 0, 0],
    },
    data: [],
    show: false,
  },
  yAxis: { 
    type: 'value', 
    name: 'Voltage (μV)', 
    splitLine: { show: false },
    show: false,
  },
  series: [],
  dataZoom: [
    {
      type: 'slider',
      show: true,
      xAxisIndex: 0,
      start: 0,
      end: 100,
      bottom: '5%', // Adjust to the bottom of the container
      height: 20, // Set slider height
      borderColor: '#ccc', // Border color
      backgroundColor: '#f7f7f7', // Background color
      fillerColor: 'rgba(144,197,237,0.2)', // Selected area color
      handleStyle: {
        color: '#fff',
        borderColor: '#ACB8D1'
      }
    }
  ],
}

chart.setOption(option)

// Load data and initialize chart
function loadData(band) {
  clearInterval(intervalId)
  isPlaying = false
  timeIndex = 0

  option.title.text = `${band} Frequency Band EEG`
  option.xAxis.data = []
  option.series = []
  chart.clear()

  // Get the currently selected brain region
  const selectedRegion = document.getElementById('regionSelect').value

  // Filter the channels to display
  const displayChannels =
    selectedRegion === 'all'
      ? channelInfo
      : channelInfo.filter((channel) => channel.group === selectedRegion)

  // Create data series only for the selected brain region channels
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
      console.error('Failed to load data:', error)
      console.error(`Attempted to load file path: data/${band}.json`)
    })
}

// Dynamically update chart
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

// Button event binding
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

// Add region selection event listener
document.getElementById('regionSelect').addEventListener('change', () => {
  const currentBand = document.querySelector('.band-btn.active').dataset.band
  loadData(currentBand)
})

// Default load Beta data
loadData('Beta')
