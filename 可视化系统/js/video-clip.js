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

    // 设置 canvas 尺寸
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 绘制当前帧到 canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // 创建新的帧图片
    const img = document.createElement('img')
    img.src = canvas.toDataURL('image/png')

    // **从左侧插入新帧**
    videoClip.insertBefore(img, videoClip.firstChild)

    // **保持最多 5 帧，移除最右侧的旧帧**
    if (videoClip.childNodes.length > maxFrames) {
      videoClip.removeChild(videoClip.lastChild)
    }

    setTimeout(extractFrames, frameInterval)
  }

  extractFrames()
})

// document.addEventListener('DOMContentLoaded', function () {
//   const video = document.getElementById('origin-video')
//   const btn = document.getElementById('playPauseButton')
//   video.play().catch((error) => {
//     console.warn('自动播放被浏览器阻止:', error)
//   })

//   btn.addEventListener('click', function () {

//   })
// })
