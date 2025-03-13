     // 画布大小
     const width = 500,
     height = 500
   const svg = d3.select('svg').attr('width', width).attr('height', height)
   const tooltip = d3.select('.tooltip') // 获取 tooltip 元素

   const radius = 150 // 雷达图基本半径
   const barBaseRadius = 180 // 光流柱状图起始半径
   const rgbBaseRadius = 165 // RGB像素流圆点起始半径（在雷达图和光流之间）
   const barMaxHeight = 90 // 光流柱最大高度
   const centerX = width / 2,
     centerY = height / 2
   const numSegments = 40 // 40个时间段

   const totalTime = 400 // 400秒时间轴
   const totalPoints = 200 // 总数据点
   const samplingRate = 0.5 // 采样率 (Hz)
   const pointsPerSegment = 5 // 每个时间段5个光流数据点
   const eegPointsPerBar = 2 // 每个光流柱代表 2 个 EEG 数据点

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
     .attr('fill', 'rgba(255, 165, 0, 0.3)')
     .attr('visibility', 'hidden')

   // 绘制网格线（40个分割段）
   for (let i = 0; i < numSegments; i++) {
     const angle = i * segmentAngle - Math.PI / 2
     const x1 = centerX,
       y1 = centerY // 从中心点开始延展
     const x2 = centerX + Math.cos(angle) * (barBaseRadius + barMaxHeight)
     const y2 = centerY + Math.sin(angle) * (barBaseRadius + barMaxHeight)

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
       console.error('数据格式错误: 期望 800 个 EEG 数据点')
       return
     }

     // EEG 值范围归一化
     const minEEG = d3.min(eegData)
     const maxEEG = d3.max(eegData)

     // EEG 值归一化到半径
     const radialScale = d3
       .scaleLinear()
       .domain([minEEG, maxEEG])
       .range([80, radius])

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

     svg
       .append('path')
       .datum(eegPoints)
       .attr('class', 'radar-line')
       .attr('d', lineGenerator)
       .attr('transform', `translate(${centerX}, ${centerY})`)
       .attr('fill', 'none')
       .attr('stroke', 'steelblue')
       .attr('stroke-width', 1)
       .attr('opacity', 0.7)

        // **绘制 EEG 数据点**
        eegPoints.forEach((point, index) => {
          const x = centerX + Math.cos(point.angle) * point.radius
          const y = centerY + Math.sin(point.angle) * point.radius

          svg
            .append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 1) // EEG 数据点大小
            .attr('fill', 'blue') // EEG 数据点颜色
            .on('mouseover', () => {
              tooltip.style('visibility', 'visible').html(`
        <b>时间点:</b> ${index + 1} <br>
        <b>EEG 值:</b> ${point.rawValue.toExponential(3)} <br>
        <b>EEG 归一化:</b> ${point.normValue.toFixed(3)}
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
            .on('click', () => {
              // 更新数字框中的时间点
              d3.select('#time-value').text(index + 1);

              // 框选第一个图片
              document.querySelectorAll('.frame').forEach(frame => {
                frame.classList.remove('highlighted-frame');
              });
              const firstFrame = document.querySelector('.frame');
              if (firstFrame) {
                firstFrame.classList.add('highlighted-frame');
              }

              // 显示对应的视频帧图在 photo-part2 容器中
              const frameImage = document.getElementById('frame-image');
              frameImage.src = `path/to/your/frame/image_${index + 1}.jpg`; // 替换为实际路径
              frameImage.style.display = 'block'; // 显示图片

              // 跳转到对应的视频时间
              // const videoTime = index / samplingRate; // 计算对应的视频时间
              // const videoElement = document.getElementById('origin-video');
              // videoElement.currentTime = videoTime; // 跳转到对应时间
              // videoElement.pause(); // 暂停视频
              console.log('显示视频帧图:', index + 1);
            })
        })

     // 读取光流数据 & RGB 数据，并绘制交互效果
     Promise.all([
       d3.json('SEED-DV/single-channel/OF_Processed/OF1.json'),
       d3.json('SEED-DV/single-channel/RGB_Processed/rgb_mean_200.json'),
     ]).then(([flowData, rgbData]) => {
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

       const flowScale = d3
         .scaleLinear()
         .domain([d3.min(flowData), d3.max(flowData)])
         .range([10, barMaxHeight])

       const rgbScale = d3.scaleLinear().domain([0, 1]).range([0.1, 1])

       // 遍历所有时间段的5个数据点
       flowData.forEach((flowValue, index) => {
         const segmentIndex = Math.floor(index / pointsPerSegment) //第几个时间区
         const subIndex = index % pointsPerSegment //第几个时间区的子区
         const rgbValue = rgbData[index] // 获取对应的 RGB 值

         // 获取当前柱子对应的 EEG 数据点/
         const eegIndex1 = segmentIndex * 10 + subIndex * eegPointsPerBar
         const eegIndex2 = eegIndex1 + 1
         // // console.log('eegIndex1:', eegIndex1)
         // const eegValue1 =
         //   eegIndex1 < totalPoints ? eegData[eegIndex1] : null
         // const eegValue2 =
         //   eegIndex2 < totalPoints ? eegData[eegIndex2] : null

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

         // 绘制光流柱
         svg
           .append('line')
           .attr('x1', x1)
           .attr('y1', y1)
           .attr('x2', x2)
           .attr('y2', y2)
           .attr('stroke', 'orange')
           .attr('stroke-width', 5)
           .on('mouseover', () => {
             highlightArc
               .attr('d', arcGenerator())
               .attr('transform', `translate(${centerX}, ${centerY})`)
               .attr('visibility', 'visible')

             tooltip.style('visibility', 'visible').html(`
         <b>时间段:</b> ${segmentIndex + 1} <br>
         <b>切片:</b> ${subIndex + 1} <br>
         <b>光流值:</b> ${flowValue.toFixed(3)} <br>
         <b>RGB 值:</b> ${rgbValue.toFixed(3)} <br>
         <b>EEG 数据 1:</b> ${
           eegValue1 !== null ? eegValue1.toFixed(3) : 'N/A'
         } <br>
         <b>EEG 数据 2:</b> ${
           eegValue2 !== null ? eegValue2.toFixed(3) : 'N/A'
         }
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
            // 更新数字框中的时间点
            d3.select('#time-value').text(segmentIndex * pointsPerSegment + subIndex + 1);

            // 框选第一个图片
            document.querySelectorAll('.frame').forEach(frame => {
              frame.classList.remove('highlighted-frame');
            });
            const firstFrame = document.querySelector('.frame');
            if (firstFrame) {
              firstFrame.classList.add('highlighted-frame');
            }

            // 跳转到对应的视频时间
            const videoTime = (segmentIndex * pointsPerSegment + subIndex) / samplingRate; // 计算对应的视频时间
            const videoElement = document.getElementById('origin-video');
            videoElement.currentTime = videoTime; // 跳转到对应时间

            // 等待视频加载并准备好绘制
            videoElement.addEventListener('seeked', function() {
              // 创建新的帧图片
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = videoElement.videoWidth;
              canvas.height = videoElement.videoHeight;

              // 绘制当前帧到 canvas
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

              // 获取图像 URL
              const frameImageUrl = canvas.toDataURL('image/png');

              // 将图像放入 .photo-part1 容器中
              const photoPart1 = document.querySelector('.photo-part1');
              photoPart1.innerHTML = `<img src="${frameImageUrl}" alt="Frame" style="width: 100%; height: 100%; object-fit: cover;">`;
            });

            videoElement.pause(); // 暂停视频
            console.log('显示视频帧图:', segmentIndex * pointsPerSegment + subIndex + 1);
          })

         // 绘制 RGB 圆点
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
           .attr('r', 2)
           .attr('fill', 'red')
           .attr('opacity', rgbScale(rgbValue))
           .on('mouseover', () => {
             highlightArc
               .attr('d', arcGenerator())
               .attr('transform', `translate(${centerX}, ${centerY})`)
               .attr('visibility', 'visible')
             tooltip.style('visibility', 'visible').html(`
         <b>时间段:</b> ${segmentIndex + 1} <br>
         <b>切片:</b> ${subIndex + 1} <br>
         <b>光流值:</b> ${flowValue.toFixed(3)} <br>
         <b>RGB 值:</b> ${rgbValue.toFixed(3)} <br>
         <b>EEG 数据 1:</b> ${
           eegValue1 !== null ? eegValue1.toFixed(3) : 'N/A'
         } <br>
         <b>EEG 数据 2:</b> ${
           eegValue2 !== null ? eegValue2.toFixed(3) : 'N/A'
         }
       `)
           })
           .on('mouseout', () => {
             tooltip.style('visibility', 'hidden')
           })
       })
     })
   })