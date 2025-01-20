      // 初始化 ECharts 实例
      const chart = echarts.init(document.getElementById('chart'))

      // 初始图表配置
      const option = {
        title: {
          text: '62 通道脑电波',
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            let content = `时间: ${params[0].name}<br/>`
            params.forEach((param) => {
              content += `${param.seriesName}: ${param.value}<br/>`
            })
            return content
          },
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '5%',
          bottom: '15%', // 为滑块留出空间
          containLabel: true,
        },
        dataZoom: [
          {
            type: 'slider', // 滑块类型
            xAxisIndex: 0, // 控制 X 轴
            start: 0, // 起始位置（0%）
            end: 100, // 结束位置（100%）
          },
          {
            type: 'inside', // 支持滚轮缩放
            xAxisIndex: 0,
          },
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          name: '时间 (ms)',
          data: [], // 时间轴数据
        },
        yAxis: {
          type: 'value',
          name: '电压 (μV)',
          splitLine: {
            show: false, // 隐藏网格线
          },
        },
        series: [], // 动态添加每个通道的数据
      }

      chart.setOption(option)

      // 加载脑电数据
      fetch('sub1_channel0.json')
        .then((response) => response.json())
        .then((data) => {
          // const numChannels = data.length // 获取通道数
          const numChannels = 3 // 获取通道数
          const frameInterval = 10 // 每次增加 1 点的时间间隔（毫秒）
          let timeIndex = 0 // 当前时间索引
          let isPlaying = true // 播放状态

          // 初始化时间轴
          const timeData = Array.from({ length: data[0].length }, (_, i) => i)

          // 配置每个通道的数据
          for (let i = 0; i < numChannels; i++) {
            option.series.push({
              name: `通道 ${i + 1}`,
              type: 'line',
              data: [],
              lineStyle: {
                color: [
                '#00ffff',  // Ch1 青色
                '#4169e1',  // Ch2 蓝色
                '#ff69b4',  // Ch3 粉色
                '#9370db',  // Ch4 紫色
                '#32cd32'   // Ch5 绿色
            ][i],
            width: 1.5,
        },
              showSymbol: false, // 不显示数据点
              smooth: true, // 平滑曲线
            })
          }

          chart.setOption(option)

          // 动态更新图表的函数
          function updateChart() {
            if (timeIndex < timeData.length && isPlaying) {
              const nextTime = timeData[timeIndex]

              // 添加每个通道的下一个点
              for (let i = 0; i < numChannels; i++) {
                const nextValue = data[i][timeIndex]
                option.series[i].data.push(nextValue)
              }

              // 更新时间轴
              option.xAxis.data.push(nextTime)

              // 更新图表
              chart.setOption(option)
              timeIndex++ // 移动到下一个时间点
            }
          }

          // 定时器 ID
          let intervalId = setInterval(updateChart, frameInterval)

          // 播放按钮功能
          document
            .getElementById('playButton')
            .addEventListener('click', () => {
              if (!isPlaying) {
                isPlaying = true
                intervalId = setInterval(updateChart, frameInterval)
              }
            })

          // 暂停按钮功能
          document
            .getElementById('pauseButton')
            .addEventListener('click', () => {
              isPlaying = false
              clearInterval(intervalId)
            })
        })
        .catch((error) => {
          console.error('Error loading brain signal data:', error)
        })

      // 更新颜色配置
      function createChartConfig(channelIndex) {
        const colors = [
          '#00ffff',  // Ch1 青色
          '#4169e1',  // Ch2 蓝色
          '#ff69b4',  // Ch3 粉色
          '#9370db',  // Ch4 紫色
          '#32cd32'   // Ch5 绿色
        ];
        
        const frequencies = [8, 2, 4, 12, 1.5];
        
        return {
          type: 'line',
          data: {
            labels: Array.from({length: 100}, (_, i) => i),
            datasets: [{
              data: generateData(frequencies[channelIndex], 1, 0, 100),
              borderColor: colors[channelIndex],
              borderWidth: 1.5,
              fill: false,
              tension: 0.4,
              pointRadius: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 0
            },
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'  // 略微可见的网格线
                },
                ticks: {
                  display: channelIndex === 4,
                  color: 'rgba(255, 255, 255, 0.5)'
                }
              },
              y: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.5)',
                  display: true
                },
                min: -1.5,
                max: 1.5
              }
            }
          }
        };
      }