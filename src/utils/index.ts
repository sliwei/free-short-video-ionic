// 获取封面
export const getVideoCoverBase64 = ({
  source,
  currentTime = 1,
  timeout = 10000,
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
    video.setAttribute('preload', 'auto')

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
      // 超时后尝试使用阿里云OSS的视频处理功能（仅当source是URL时）
      if (typeof source === 'string') {
        // fallbackToAliyunOSS(source, resolve, reject)
      } else {
        reject(new Error('获取视频封面超时'))
      }
    }, timeout)

    const handleError = (e: any) => {
      // console.log('视频加载错误', e)
      cleanup()
      // 错误后尝试使用阿里云OSS的视频处理功能（仅当source是URL时）
      if (typeof source === 'string') {
        // fallbackToAliyunOSS(source, resolve, reject)
      } else {
        reject(new Error('加载视频失败'))
      }
    }

    // 处理视频元数据加载完成
    const handleLoadedMetadata = () => {
      // console.log('loadedmetadata')
      // 如果视频时长大于0，直接尝试获取封面
      if (video.duration > 0) {
        // 设置视频时间点
        video.currentTime = Math.min(currentTime, video.duration || 1)
      }
    }

    // 处理视频数据加载完成
    const handleLoadedData = () => {
      // console.log('loadeddata')
      // 设置视频时间点
      video.currentTime = Math.min(currentTime, video.duration || 1)
    }

    // 处理视频可以播放
    const handleCanPlay = () => {
      // console.log('canplay')
      // 设置视频时间点
      video.currentTime = Math.min(currentTime, video.duration || 1)
    }

    // 处理视频跳转完成
    const handleSeeked = () => {
      // console.log('seeked')
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
          const dataURL = canvas.toDataURL('image/jpeg')
          cleanup()
          resolve({
            width,
            height,
            base64: dataURL
          })
        } else {
          cleanup()
          // 无法获取画布上下文时尝试使用阿里云OSS的视频处理功能（仅当source是URL时）
          if (typeof source === 'string') {
            // fallbackToAliyunOSS(source, resolve, reject)
          } else {
            reject(new Error('无法获取画布上下文'))
          }
        }
      } catch (error) {
        cleanup()
        // 捕获帧出错时尝试使用阿里云OSS的视频处理功能（仅当source是URL时）
        if (typeof source === 'string') {
          // fallbackToAliyunOSS(source, resolve, reject)
        } else {
          reject(error)
        }
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
