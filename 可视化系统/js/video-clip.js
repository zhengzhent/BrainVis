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

// 交互展示前后帧
// 显示指定时间的前中后三帧
// 显示指定时间的前两帧、中间帧、后两帧
function displayFiveFramesAtTime(clickedTime) {
  const frameInterval = 0.2 // 每隔 200ms 提取一帧
  const targetTimes = [
    clickedTime - 2 * frameInterval, // 前两帧
    clickedTime - frameInterval,
    clickedTime, // 中间帧
    clickedTime + frameInterval, // 后两帧
    clickedTime + 2 * frameInterval,
  ]

  // 清空之前的帧
  videoClip.innerHTML = ''

  // 遍历目标时间点，依次提取并插入帧
  targetTimes.forEach((time) => {
    // 如果时间小于 0 或大于视频总时长，则跳过
    if (time < 0 || time > video.duration) {
      const placeholder = document.createElement('div')
      placeholder.style.width = '100px' // 占位宽度
      placeholder.style.height = '100px'
      placeholder.style.display = 'inline-block'
      videoClip.appendChild(placeholder)
      return
    }

    // 临时暂停视频，跳转到目标时间
    video.currentTime = time

    // 等待视频 seek 完成后提取帧
    video.addEventListener('seeked', function extractFrame() {
      // 设置 canvas 尺寸
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // 绘制当前帧到 canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // 创建新的帧图片
      const img = document.createElement('img')
      img.src = canvas.toDataURL('image/png')
      img.style.margin = '0 5px' // 间隔
      img.style.borderRadius = '8px' // 圆角效果

      // **顺序插入视频帧**
      videoClip.appendChild(img)

      // 移除事件监听，防止重复执行
      video.removeEventListener('seeked', extractFrame)
    })
  })
}
