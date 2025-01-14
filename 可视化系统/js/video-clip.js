const video = document.getElementById('origin-video')
const videoClip = document.getElementById('video-clip')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

// 每隔一段时间提取帧
video.addEventListener('play', () => {
  const frameInterval = 200 // 每隔 200ms 提取一帧
  const maxFrames = 5 // 最多显示 5 帧

  const extractFrames = () => {
    if (video.paused || video.ended) {
      return
    }

    // 设置 canvas 尺寸为视频尺寸
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 将当前帧绘制到 canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // 创建图像元素并添加到 video-clip
    const img = document.createElement('img')
    img.src = canvas.toDataURL('image/png')
    videoClip.appendChild(img)

    // 保持最多 5 帧
    if (videoClip.childNodes.length > maxFrames) {
      videoClip.removeChild(videoClip.firstChild)
    }

    setTimeout(extractFrames, frameInterval)
  }

  extractFrames()
})
