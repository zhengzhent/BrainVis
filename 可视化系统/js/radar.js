// 画布大小
      const width = 1000,
        height = 1000
      const svg = d3.select('svg').attr('width', width).attr('height', height)
      // .attr('transform', 'scale(0.5)')
      const tooltip = d3.select('.tooltip') // 获取 tooltip 元素

      const radius = 240 // 雷达图基本半径
      const barBaseRadius = 350 // 光流柱状图起始半径
      const rgbBaseRadius = 325 // RGB像素流圆点起始半径（在雷达图和光流之间）
      const barMaxHeight = 100 // 光流柱最大高度
      const centerX = width / 2,
        centerY = height / 2
      const numSegments = 40 // 40个时间段

      const totalTime = 400 // 400秒时间轴
      const totalPoints = 200 // 总数据点
      const samplingRate = 0.5 // 采样率 (Hz)
      const pointsPerSegment = 5 // 每个时间段5个光流数据点
      const eegPointsPerBar = 1 // 每个光流柱代表 2 个 EEG 数据点

      const deBaseRadius = 270 // 在 EEG 数据点（最大240） 和 RGB 点（325）之间
      const deMaxHeight = 40 // DE 数据条的最大高度

      // 设定 DE 数据的显示阈值（可调整）
      // const deThreshold = -20.0823 //Beta sub5
      // const deThreshold = -21.8978 //gamma sub1
      const deThreshold = -21.0341 //gamma sub5

      // **角度计算**
      const segmentAngle = (2 * Math.PI) / numSegments // 每个时间段的总角度（9°）
      const barWidth = (segmentAngle * 0.9) / pointsPerSegment // 让数据填满时间段90%，留10%间隙

      // **调整角度映射，使 EEG 数据从 12 点钟方向 (-90°) 开始**
      const angleScale = d3
        .scaleLinear()
        .domain([0, totalTime])
        .range([-Math.PI / 2, (3 * Math.PI) / 2]) // 12点钟方向开始

      // **添加高亮的扇形路径**
      const highlightArc = svg
        .append('path')
        .attr('fill', 'rgba(211, 211, 211, 0.5)')
        .attr('visibility', 'hidden')

      // 绘制网格线（40个分割段）
      for (let i = 0; i < numSegments; i++) {
        const angle = i * segmentAngle - Math.PI / 2
        const x1 = centerX,
          y1 = centerY // 从中心点开始延展
        const x2 =
          centerX + Math.cos(angle) * (barBaseRadius + barMaxHeight - 80)
        const y2 =
          centerY + Math.sin(angle) * (barBaseRadius + barMaxHeight - 80)

        svg
          .append('line')
          .attr('class', 'grid-line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
      }

      // 读取 EEG 数据并绘制雷达图
      d3.json(
        'SEED-DV/single-channel/EEG_Feature/sub5_block1_PSD_2s_OZ_Gamma.json',
      ).then((eegData) => {
        console.log('原始EEG数据:', eegData)

        if (!Array.isArray(eegData) || eegData.length !== totalPoints) {
          console.error('数据格式错误: 期望 200 个 EEG 数据点')
          return
        }

        // EEG 值范围归一化
        const minEEG = d3.min(eegData)
        const maxEEG = d3.max(eegData)

        // EEG 值归一化到半径
        const radialScale = d3
          .scaleLinear()
          .domain([minEEG, maxEEG])
          .range([150, radius])

        // EEG 值归一化到 [0,1] 范围
        const eegNormalizeScale = d3
          .scaleLinear()
          .domain([minEEG, maxEEG])
          .range([0, 1])

        // 计算所有 EEG 数据点的极坐标位置
        let eegPoints = eegData.map((value, index) => {
          let time = index / samplingRate
          return {
            angle: angleScale(time),
            radius: radialScale(value),
            rawValue: value, // 原始值
            normValue: eegNormalizeScale(value), // 归一化值
          }
        })

        // console.log('转换后的EEG数据:', eegPoints)

        // **绘制连接 EEG 数据点的线**
        const lineGenerator = d3
          .lineRadial()
          .angle((d) => d.angle + Math.PI / 2) // **额外顺时针旋转 90°**
          .radius((d) => d.radius)
          .curve(d3.curveCatmullRom.alpha(0.5)) // **平滑曲线**
        const defs = svg.append('defs')

        const gradient = defs
          .append('radialGradient')
          .attr('id', 'eegGradient')
          .attr('cx', '59%') // 确保渐变中心点在圆心
          .attr('cy', '45%')
          .attr('r', '100%') // 让渐变更集中在 EEG 数据区域内

        // 定义更丝滑、外侧更深的渐变颜色
        // 定义更丝滑、外侧更深的渐变颜色
        gradient
          .append('stop')
          .attr('offset', '0%') // 起点，最浅
          .attr('stop-color', '#E0F7FF') // 浅蓝
          .attr('stop-opacity', 0.3)

        gradient
          .append('stop')
          .attr('offset', '20%')
          .attr('stop-color', '#66B2D6') // 柔和中浅蓝
          .attr('stop-opacity', 0.5)

        gradient
          .append('stop')
          .attr('offset', '50%')
          .attr('stop-color', '#0072B2') // 标准中蓝
          .attr('stop-opacity', 0.9)

        gradient
          .append('stop')
          .attr('offset', '80%')
          .attr('stop-color', '#1B355C') // 深蓝灰
          .attr('stop-opacity', 0.95)

        gradient
          .append('stop')
          .attr('offset', '100%') // 最外圈
          .attr('stop-color', '#001933') // 极深蓝，几乎黑蓝
          .attr('stop-opacity', 1)

        // **绘制填充区域**
        svg
          .append('path')
          .datum(eegPoints)
          .attr('class', 'eeg-fill')
          .attr('d', lineGenerator)
          .attr('transform', `translate(${centerX}, ${centerY})`)
          .attr('fill', 'url(#eegGradient)') // **填充渐变色**
          .attr('stroke', 'none')
          .attr('opacity', 1)

        svg
          .append('path')
          .datum(eegPoints)
          .attr('class', 'radar-line')
          .attr('d', lineGenerator)
          .attr('transform', `translate(${centerX}, ${centerY})`)
          .attr('fill', 'none')
          .attr('stroke', 'steelblue')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.3)

        // 读取光流数据 & RGB 数据，并绘制交互效果
        Promise.all([
          d3.json('SEED-DV/single-channel/OF_Processed/OF1.json'), //读取 光流 特征数据
          d3.json('SEED-DV/single-channel/RGB_Processed/rgb_mean_200.json'), //读取 RGB 特征数据
          d3.json(
            'SEED-DV/single-channel/EEG_Feature/sub5_block1_DE_2s_OZ_Gamma.json',
          ), // 读取 DE 特征数据
        ]).then(([flowData, rgbData, deData]) => {
          if (
            !Array.isArray(flowData) ||
            flowData.length !== numSegments * pointsPerSegment
          ) {
            console.error('光流数据格式错误')
            return
          }
          if (
            !Array.isArray(rgbData) ||
            rgbData.length !== numSegments * pointsPerSegment
          ) {
            console.error('RGB 数据格式错误')
            return
          }
          if (
            !Array.isArray(deData) ||
            deData.length !== numSegments * pointsPerSegment
          ) {
            console.error('DE 数据格式错误')
            return
          }

          // // 手动指定不同Clip的颜色
          const categoryColors = [
            '#FFD700',
            '#FFD700',
            '#1E90FF',
            '#D2691E',
            '#FF8C00',
            '#2E8B57',
            '#D2691E',
            '#FF4500',
            '#FFD700',
            '#F4A460',
            '#8B4513',
            '#666666',
            '#D2691E',
            '#FF8C00',
            '#FFD700',
            '#FF4500',
            '#FF8C00',
            '#FFD700',
            '#FF4500',
            '#666666',
            '#666666',
            '#D2691E',
            '#FF4500',
            '#FF8C00',
            '#D2691E',
            '#FFD700',
            '#F4A460',
            '#8B4513',
            '#2E8B57',
            '#8B4513',
            '#FF4500',
            '#D2691E',
            '#1E90FF',
            '#2E8B57',
            '#8B4513',
            '#8B4513',
            '#1E90FF',
            '#F4A460',
            '#D2691E',
            '#1E90FF',
          ]
          const categoryColorsName = [
            'Natural Scene',
            'Natural Scene',
            'Water Animal',
            'Land Animal',
            'Exercise',
            'Plant',
            'Land Animal',
            'Transportation',
            'Natural Scene',
            'Human',
            'Food',
            'Musical',
            'Land Animal',
            'Exercise',
            'Natural Scene',
            'Transportation',
            'Exercise',
            'Natural Scene',
            'Transportation',
            'Musical',
            'Musical',
            'Land Animal',
            'Transportation',
            'Exercise',
            'Land Animal',
            'Natural Scene',
            'Human',
            'Food',
            'Plant',
            'Food',
            'Transportation',
            'Land Animal',
            'Water Animal',
            'Plant',
            'Food',
            'Food',
            'Water Animal',
            'Human',
            'Land Animal',
            'Water Animal',
          ]

          //光流数据映射到[10, barMaxHeight]
          const flowScale = d3
            .scaleLinear()
            .domain([d3.min(flowData), d3.max(flowData)])
            .range([10, barMaxHeight])

          //rgb数据映射到0.1 - 1 颜色深度
          const rgbScale = d3.scaleLinear().domain([0, 1]).range([0.1, 1])

          //Flow数据 0-1归一化
          const flowNormalizationScale = d3
            .scaleLinear()
            .domain([d3.min(flowData), d3.max(flowData)])
            .range([0, 1])

          //DE数据 0-1归一化
          const deNormalizationScale = d3
            .scaleLinear()
            .domain([d3.min(deData), d3.max(deData)])
            .range([0, 1])

          // 遍历所有时间段的5个数据点
          flowData.forEach((flowValue, index) => {
            const segmentIndex = Math.floor(index / pointsPerSegment) //第几个时间区
            const subIndex = index % pointsPerSegment //第几个时间区的子区
            const rgbValue = rgbData[index] // 获取对应的 RGB 值
            const deValue = deData[index] //获取对应的de值

            const color = categoryColors[Math.floor(index / pointsPerSegment)]
            // console.log('color:', color)

            // 获取当前柱子对应的 EEG 数据点/
            const eegIndex1 = segmentIndex * 5 + subIndex * eegPointsPerBar
            const eegIndex2 = eegIndex1 + 1
            // 若窗口1s则要采用两个数据点index
            // // console.log('eegIndex1:', eegIndex1)
            // const eegValue1 =
            //   eegIndex1 < totalPoints ? eegData[eegIndex1] : null
            // const eegValue2 =
            //   eegIndex2 < totalPoints ? eegData[eegIndex2] : null
            // console.log('Index1：', eegIndex1)
            // console.log('Index2：', eegIndex2)
            const eegValue1 =
              eegIndex1 < totalPoints
                ? eegNormalizeScale(eegData[eegIndex1])
                : null
            const eegValue2 =
              eegIndex2 < totalPoints
                ? eegNormalizeScale(eegData[eegIndex2])
                : null
            const baseAngle = angleScale(
              segmentIndex * (totalTime / numSegments) + 1.5,
            )

            //DE数据0-1归一化
            const deNormalizationValue = deNormalizationScale(deData[index])
            //flow数据0-1归一化
            const flowNormalizationValue = flowNormalizationScale(
              flowData[index],
            )

            const angle = baseAngle + subIndex * barWidth

            const height = flowScale(flowValue)
            const x1 = centerX + Math.cos(angle) * barBaseRadius
            const y1 = centerY + Math.sin(angle) * barBaseRadius
            const x2 = centerX + Math.cos(angle) * (barBaseRadius + height)
            const y2 = centerY + Math.sin(angle) * (barBaseRadius + height)

            // **修正扇形高亮区域，使其与当前悬浮的柱子对齐**
            const arcGenerator = d3
              .arc()
              .innerRadius(0)
              .outerRadius(barBaseRadius + height)
              .startAngle(angle - barWidth / 2 + Math.PI / 2) // 修正角度偏移
              .endAngle(angle + barWidth / 2 + Math.PI / 2)

            // 绘制光流柱---------------------------------------------------------------------------------------------------------------
            svg
              .append('line')
              .attr('x1', x1)
              .attr('y1', y1)
              .attr('x2', x2)
              .attr('y2', y2)
              .attr('stroke', color)
              .attr('stroke-width', 5)
              .on('mouseover', () => {
                highlightArc
                  .attr('d', arcGenerator())
                  .attr('transform', `translate(${centerX}, ${centerY})`)
                  .attr('visibility', 'visible')

                tooltip.style('visibility', 'visible').html(`
                        <b>Class: </b> ${segmentIndex + 1} <br>
                        <b>Clip: </b> ${subIndex + 1} <br>
                        <b>OpticalFlow: </b> ${flowNormalizationValue.toFixed(
                          3,
                        )} <br>
                        <b>RGB Pixel Stream: </b> ${rgbValue.toFixed(3)} <br>
                        <b>EEG DE: </b> ${deNormalizationValue.toFixed(3)}<br>
                        <b>EEG PSD: </b> ${
                          eegValue1 !== null ? eegValue1.toFixed(3) : 'N/A'
                        } <br>
                        <b>Class: <b>${
                          categoryColorsName[
                            Math.floor(index / pointsPerSegment)
                          ]
                        }<br>
                      `)
              })
              .on('mousemove', (event) => {
                tooltip
                  .style('top', `${event.pageY + 10}px`)
                  .style('left', `${event.pageX + 10}px`)
              })
              .on('mouseout', () => {
                highlightArc.attr('visibility', 'hidden')
                tooltip.style('visibility', 'hidden')
              })
              .on('click', () => {
                console.log('光流柱被点击，固定切换time1数据源');
                
                if (typeof window.switchHeatmapData === 'function') {
                  window.switchHeatmapData('time1'); 
                }
              });
            // 绘制 RGB 圆点-------------------------------------------------------------------------------------
            const rgbX = centerX + Math.cos(angle) * rgbBaseRadius
            const rgbY = centerY + Math.sin(angle) * rgbBaseRadius

            const rgbArcGenerator = d3
              .arc()
              .innerRadius(0)
              .outerRadius(barBaseRadius)
              .startAngle(angle - barWidth / 2 + Math.PI / 2)
              .endAngle(angle + barWidth / 2 + Math.PI / 2)

            svg
              .append('circle')
              .attr('cx', rgbX)
              .attr('cy', rgbY)
              .attr('r', 4)
              .attr('fill', 'red')
              .attr('opacity', rgbScale(rgbValue))
              .on('mouseover', () => {
                highlightArc
                  .attr('d', arcGenerator())
                  .attr('transform', `translate(${centerX}, ${centerY})`)
                  .attr('visibility', 'visible')

                tooltip.style('visibility', 'visible').html(`
                        <b>Class: </b> ${segmentIndex + 1} <br>
                        <b>Clip: </b> ${subIndex + 1} <br>
                        <b>OpticalFlow: </b> ${flowNormalizationValue.toFixed(
                          3,
                        )} <br>
                        <b>RGB Pixel Stream: </b> ${rgbValue.toFixed(3)} <br>
                        <b>EEG DE: </b> ${deNormalizationValue.toFixed(3)}<br>
                        <b>EEG PSD: </b> ${
                          eegValue1 !== null ? eegValue1.toFixed(3) : 'N/A'
                        } <br>
                        <b>Class: <b>${
                          categoryColorsName[
                            Math.floor(index / pointsPerSegment)
                          ]
                        }<br>
                      `)
              })
              .on('mouseout', () => {
                tooltip.style('visibility', 'hidden')
              })

            //DE阈值---------------------------------------------------------------------------------
            // DE 数据归一化
            const deScale = d3
              .scaleLinear()
              .domain([d3.min(deData), d3.max(deData)])
              .range([0, deMaxHeight])

            // 计算 DE 条形的高度
            const deHeight = deScale(deValue)

            // 只有 DE 值大于阈值才绘制条形
            if (deValue > deThreshold) {
              const x1 = centerX + Math.cos(angle) * deBaseRadius
              const y1 = centerY + Math.sin(angle) * deBaseRadius
              const x2 = centerX + Math.cos(angle) * (deBaseRadius + deHeight)
              const y2 = centerY + Math.sin(angle) * (deBaseRadius + deHeight)

              svg
                .append('line')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2)
                .attr('stroke', 'purple') // DE 数据条颜色
                .attr('stroke-width', 3)
                .on('mouseover', () => {
                  tooltip.style('visibility', 'visible').html(`
                          <b>Class: </b> ${segmentIndex + 1} <br>
                          <b>Clip: </b> ${subIndex + 1} <br>
                          <b>OpticalFlow: </b> ${flowNormalizationValue.toFixed(
                            3,
                          )} <br>
                          <b>RGB Pixel Stream: </b> ${rgbValue.toFixed(3)} <br>
                          <b>EEG DE: </b> ${deNormalizationValue.toFixed(3)}<br>
                          <b>EEG PSD: </b> ${
                            eegValue1 !== null ? eegValue1.toFixed(3) : 'N/A'
                          } <br>
                          <b>Class: <b>${
                            categoryColorsName[
                              Math.floor(index / pointsPerSegment)
                            ]
                          }<br>
                        `)
                })
                .on('mousemove', (event) => {
                  tooltip
                    .style('top', `${event.pageY + 10}px`)
                    .style('left', `${event.pageX + 10}px`)
                })
                .on('mouseout', () => {
                  tooltip.style('visibility', 'hidden')
                })
            }
          })
        })
      })
      // ----------------------------------------------------其他样式
      // **标注数字的位置**
      const labels = [
        { angle: -Math.PI / 2, text: '1' }, // 12点钟方向
        { angle: 0, text: '10' }, // 3点钟方向
        { angle: Math.PI / 2, text: '20' }, // 6点钟方向
        { angle: Math.PI, text: '30' }, // 9点钟方向
        { angle: -Math.PI / 4, text: '5' }, // 2点钟方向
        { angle: Math.PI / 4, text: '15' }, // 5点钟方向
        { angle: (Math.PI * 3) / 4, text: '25' }, // 7点钟方向
        { angle: (Math.PI * 5) / 4, text: '35' }, // 10点钟方向
      ]

      // **添加四个数字标签**
      labels.forEach((label) => {
        const x = centerX + Math.cos(label.angle) * (radius + 220) // 半径外 20px
        const y = centerY + Math.sin(label.angle) * (radius + 220)

        svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'grey')
          .attr('font-size', '40px')
          .attr('font-weight', 'bold')
          .text(label.text)
      })
      // -----------------------------------------------------指针移动
      const pointerRadius = 260
      const totalSegments = 40 // 40 个时间段
      const segmentTime = 13 // 每个时间段 13s
      const totalTime2 = 520 // 总时间 520s
      const segmentAngle2 = 360 / totalSegments // 每个时间段 9°（角度制）

      // 变量定义
      let isPaused = true
      let wasPaused = false // **标记是否是暂停后继续**
      let isFirstStart = true // **标记是否是第一次启动**
      let currentAngle = -90 // **指针的实时角度，从12点方向开始**
      let animationTimer

      // const clockHand = d3.select('#clockHand')
      d3.select('#clockHand').remove() // **删除旧的指针，避免层级问题**

      // **在 SVG 中定义箭头样式**
      const defs = svg.append('defs')
      defs
        .append('marker')
        .attr('id', 'arrowHead')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 7) // **箭头尖端对齐指针末端**
        .attr('refY', 5)
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z') // **绘制三角形箭头**
        .attr('fill', 'black') // **箭头颜色**

      d3.select('clockHand').remove()
      const clockHand = svg
        .append('line')
        .attr('id', 'clockHand')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', centerX + Math.cos(-Math.PI / 2) * pointerRadius)
        .attr('y2', centerY + Math.sin(-Math.PI / 2) * pointerRadius)
        .attr('stroke', 'black')
        .attr('stroke-width', 4)
        .attr('stroke-linecap', 'butt')
        .attr('marker-end', 'url(#arrowHead)') // **添加箭头**

      clockHand.raise() // **将指针提升到最高层**
      svg.node().appendChild(clockHand.node())

      const controlButton = document.getElementById('playPauseButton')

      // **指针运动逻辑**
      function moveClockHand() {
        if (isPaused) return // **如果暂停，直接返回，不执行动画**

        let targetAngle = currentAngle + segmentAngle2 // **计算目标角度**

        // **如果是首次启动，则先等待 3 秒**
        if (isFirstStart) {
          isFirstStart = false // **标记不再是第一次启动**
          setTimeout(() => {
            if (!isPaused) {
              moveClockHand() // **开始正常运动**
            }
          }, 3000) // **初次启动暂停 3 秒**
          return
        }

        // **如果是暂停后继续，则不等待 3 秒，直接播放**
        if (wasPaused) {
          wasPaused = false // **重置暂停标志**
          clockHand
            .transition()
            // .duration(10000) // **10s 运动**
            .duration(10000)
            .ease(d3.easeLinear)
            .attr(
              'x2',
              centerX + Math.cos((targetAngle * Math.PI) / 180) * pointerRadius,
            )
            .attr(
              'y2',
              centerY + Math.sin((targetAngle * Math.PI) / 180) * pointerRadius,
            )
            .on('end', function () {
              if (!isPaused) {
                // **如果暂停，停止递归调用**
                currentAngle = targetAngle // **更新当前角度**
                moveClockHand() // **继续下一步**
              }
            })
        } else {
          // **正常逻辑，先暂停 3 秒后再运动**
          animationTimer = setTimeout(() => {
            if (!isPaused) {
              clockHand
                .transition()
                // .duration(10000) // **10s 运动**
                .duration(10000)
                .ease(d3.easeLinear)
                .attr(
                  'x2',
                  centerX +
                    Math.cos((targetAngle * Math.PI) / 180) * pointerRadius,
                )
                .attr(
                  'y2',
                  centerY +
                    Math.sin((targetAngle * Math.PI) / 180) * pointerRadius,
                )
                .on('end', function () {
                  if (!isPaused) {
                    // **如果暂停，停止递归调用**
                    currentAngle = targetAngle // **更新当前角度**
                    moveClockHand() // **继续下一步**
                  }
                })
            }
          }, 3000) // **先暂停 3s**
        }
      }

      controlButton.addEventListener('click', function (event) {
        event.preventDefault() // **防止按钮的默认提交行为**
        if (isPaused) {
          isPaused = false
          wasPaused = true
          controlButton.textContent = 'Stop'
          moveClockHand()
        } else {
          isPaused = true
          controlButton.textContent = 'Play Video & EEG'

          clearTimeout(animationTimer)
          clockHand.transition().duration(0)
        }
      })