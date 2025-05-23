// 获取封面
export const getVideoCoverBase64 = ({
  source,
  currentTime = 1, // 默认获取视频开始 0.1 秒的帧
  timeout = 5000, // 减少超时时间，因为只获取部分数据
  maxSide = 512
}: {
  source: string | File
  currentTime?: number
  timeout?: number
  maxSide?: number
}): Promise<{ width: number; height: number; base64: string }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.setAttribute('crossOrigin', 'anonymous')
    video.setAttribute('preload', 'metadata') // 只预加载元数据
    video.setAttribute('playsinline', 'true') // 添加 playsinline 属性
    video.muted = true // 静音播放

    // 定义清理函数
    let cleanup = () => {
      clearTimeout(timeoutId)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('seeked', handleSeeked)
      video.pause()
      video.src = ''
    }

    // 根据输入类型设置视频源
    if (source instanceof File) {
      // 如果是File对象，创建URL
      const objectUrl = URL.createObjectURL(source)
      video.setAttribute('src', objectUrl)

      // 扩展清理函数以释放URL
      const originalCleanup = cleanup
      cleanup = () => {
        URL.revokeObjectURL(objectUrl)
        originalCleanup()
      }
    } else {
      // 如果是URL字符串
      video.setAttribute('src', source)
    }

    // 设置超时处理
    const timeoutId = setTimeout(() => {
      cleanup()
      reject('获取视频封面超时')
    }, timeout)

    const handleError = (e: any) => {
      cleanup()
      reject('加载视频失败')
    }

    // 处理视频元数据加载完成
    const handleLoadedMetadata = () => {
      try {
        // 设置视频时间点
        video.currentTime = Math.min(currentTime, video.duration || 0.1)
      } catch (error) {
        console.error('设置视频时间点失败:', error)
        cleanup()
        reject('设置视频时间点失败')
      }
    }

    // 处理视频数据加载完成
    const handleLoadedData = () => {
      try {
        // 设置视频时间点
        video.currentTime = Math.min(currentTime, video.duration || 0.1)
      } catch (error) {
        console.error('设置视频时间点失败:', error)
        cleanup()
        reject('设置视频时间点失败')
      }
    }

    // 处理视频可以播放
    const handleCanPlay = () => {
      try {
        // 设置视频时间点
        video.currentTime = Math.min(currentTime, video.duration || 0.1)
      } catch (error) {
        console.error('设置视频时间点失败:', error)
        cleanup()
        reject('设置视频时间点失败')
      }
    }

    // 处理视频跳转完成
    const handleSeeked = () => {
      captureFrame()
    }

    // 捕获视频帧
    const captureFrame = () => {
      try {
        const canvas = document.createElement('canvas')
        const width = video.videoWidth || 300
        const height = video.videoHeight || 200
        const ratio = width > height ? maxSide / width : maxSide / height
        canvas.width = width * ratio
        canvas.height = height * ratio
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataURL = canvas.toDataURL('image/jpeg', 0.8) // 降低图片质量以减小大小
          cleanup()
          resolve({
            width,
            height,
            base64: dataURL
          })
        } else {
          cleanup()
          reject('无法获取画布上下文')
        }
      } catch (error) {
        console.error('捕获视频帧失败:', error)
        cleanup()
        reject(error)
      }
    }

    // 添加多个事件监听，提高成功率
    video.addEventListener('error', handleError)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('seeked', handleSeeked)

    // 开始加载视频
    video.load()
  })
}

// 延时函数
export const steep = (t: number = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, t)
  })
}
