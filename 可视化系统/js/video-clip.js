const video = document.getElementById('origin-video')
const videoClip = document.getElementById('video-clip')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

// 每隔一段时间提取帧
video.addEventListener('play', () => {
  const frameInterval = 41 // 每隔 41ms 提取一帧
  const maxFrames = 8 // 最多显示 8 帧

  const extractFrames = () => {
    if (video.paused || video.ended) {
      return
    }

    // 设置 canvas 尺寸
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 绘制当前帧到 canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // 创建新的帧图片
    const img = document.createElement('img')
    img.src = canvas.toDataURL('image/png')
    img.classList.add('frame') // 添加类名 'frame'

    // **从右侧插入新帧**
    videoClip.appendChild(img) // 新帧追加到右侧

    // **保持最多 8 帧，移除最左侧的旧帧**
    if (videoClip.childNodes.length > maxFrames) {
      videoClip.removeChild(videoClip.firstChild) // 移除最左侧的帧
    }

    setTimeout(extractFrames, frameInterval)
  }

  extractFrames()
})

// 交互展示前后帧
// 显示指定时间的前两帧、中间帧、后两帧
async function displayFiveFramesAtTime(clickedTime) {
  const frameInterval = 0.041
  const targetTimes = [
    clickedTime - 4 * frameInterval,
    clickedTime - 3 * frameInterval,
    clickedTime - 2 * frameInterval,
    clickedTime - frameInterval,
    clickedTime, // 中间帧
    clickedTime + frameInterval, // 后两帧
    clickedTime + 2 * frameInterval,
    clickedTime + 3 * frameInterval,
  ]
  // console.log('1:', targetTimes[0]) // 打印 clickedIndex 的值
  // console.log('2:', targetTimes[1]) // 打印 clickedIndex 的值
  // console.log('3:', targetTimes[2]) // 打印 clickedIndex 的值
  // console.log('4:', targetTimes[3]) // 打印 clickedIndex 的值
  // 清空之前的帧
  videoClip.innerHTML = ''

  for (let i = 0; i < targetTimes.length; i++) {
    const time = targetTimes[i]

    // 跳过无效时间点
    if (time < 0 || time > video.duration) {
      const placeholder = document.createElement('div')
      placeholder.style.width = '100px'
      placeholder.style.height = '100px'
      placeholder.style.display = 'inline-block'
      placeholder.style.background = 'rgba(0, 0, 0, 0.1)' // 透明占位
      videoClip.appendChild(placeholder)
      continue
    }

    // **等待视频跳转到目标时间**
    video.currentTime = time
    await new Promise((resolve) =>
      video.addEventListener('seeked', resolve, { once: true }),
    )

    // **提取帧**
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // **创建帧图片**
    const img = document.createElement('img')
    img.src = canvas.toDataURL('image/png')
    img.style.margin = '0 3px'
    img.style.borderRadius = '6px'
    img.style.transition = 'transform 0.3s ease'

    // **中间帧高亮**
    if (i === 4) {
      img.style.border = '2px solid red'
      img.style.transform = 'scale(1.0)'
    }

    videoClip.appendChild(img)
  }
}
