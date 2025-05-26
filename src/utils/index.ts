// 获取封面
export class VideoCoverExtractor {
  private video: HTMLVideoElement
  private timeoutId: number | null = null
  private source: string | File
  private currentTime: number
  private timeout: number
  private maxSide: number
  private objectUrl: string | null = null
  private isCancelled = false
  private resolvePromise: ((value: { width: number; height: number; base64: string }) => void) | null = null
  private rejectPromise: ((reason?: any) => void) | null = null
  private canvas: HTMLCanvasElement | null = null

  constructor({ source, currentTime = 1, timeout = 5000, maxSide = 0 }: { source: string | File; currentTime?: number; timeout?: number; maxSide?: number }) {
    this.source = source
    this.currentTime = currentTime
    this.timeout = timeout
    this.maxSide = maxSide

    // 创建视频元素
    this.video = document.createElement('video')
    this.video.setAttribute('crossOrigin', 'anonymous')
    this.video.setAttribute('preload', 'metadata')
    this.video.setAttribute('playsinline', 'true')
    this.video.muted = true

    // 创建可重用的 canvas
    this.canvas = document.createElement('canvas')
  }

  public getBase64(): Promise<{ width: number; height: number; base64: string }> {
    return new Promise((resolve, reject) => {
      if (this.isCancelled) {
        reject('已取消')
        return
      }

      this.resolvePromise = resolve
      this.rejectPromise = reject

      // 设置视频源
      if (this.source instanceof File) {
        this.objectUrl = URL.createObjectURL(this.source)
        this.video.setAttribute('src', this.objectUrl)
      } else {
        this.video.setAttribute('src', this.source)
      }

      // 设置超时处理
      this.timeoutId = window.setTimeout(() => {
        this.cleanup()
        reject('获取视频封面超时')
      }, this.timeout)

      // 只监听必要的事件
      this.video.addEventListener('error', this.handleError)
      this.video.addEventListener('loadedmetadata', this.handleLoadedMetadata)
      this.video.addEventListener('seeked', this.handleSeeked)

      // 开始加载视频
      this.video.load()
    })
  }

  public cancel(): void {
    this.isCancelled = true
    if (this.rejectPromise) {
      this.rejectPromise('操作已取消')
    }
    this.cleanup()
  }

  private cleanup = (): void => {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    this.video.removeEventListener('error', this.handleError)
    this.video.removeEventListener('loadedmetadata', this.handleLoadedMetadata)
    this.video.removeEventListener('seeked', this.handleSeeked)

    this.video.pause()
    this.video.src = ''

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = null
    }

    this.resolvePromise = null
    this.rejectPromise = null
  }

  private handleError = (e: Event): void => {
    if (this.isCancelled) return
    this.cleanup()
    if (this.rejectPromise) {
      this.rejectPromise('加载视频失败')
    }
  }

  private handleLoadedMetadata = (): void => {
    if (this.isCancelled) return
    try {
      this.video.currentTime = Math.min(this.currentTime, this.video.duration || 0.1)
    } catch (error) {
      console.error('设置视频时间点失败:', error)
      this.cleanup()
      if (this.rejectPromise) {
        this.rejectPromise('设置视频时间点失败')
      }
    }
  }

  private handleSeeked = (): void => {
    if (this.isCancelled) return
    this.captureFrame()
  }

  private captureFrame = (): void => {
    if (this.isCancelled) return

    try {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas')
      }

      const width = this.video.videoWidth || 300
      const height = this.video.videoHeight || 200
      let maxSide = this.maxSide

      if (maxSide <= 0) {
        maxSide = Math.max(width, height)
      }

      const ratio = width > height ? maxSide / width : maxSide / height
      this.canvas.width = width * ratio
      this.canvas.height = height * ratio

      const ctx = this.canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)
        const dataURL = this.canvas.toDataURL('image/jpeg', 1)

        if (this.resolvePromise) {
          this.resolvePromise({
            width,
            height,
            base64: dataURL
          })
        }

        this.cleanup()
      } else {
        this.cleanup()
        if (this.rejectPromise) {
          this.rejectPromise('无法获取画布上下文')
        }
      }
    } catch (error) {
      console.error('捕获视频帧失败:', error)
      this.cleanup()
      if (this.rejectPromise) {
        this.rejectPromise(error)
      }
    }
  }
}

// 延时函数
export const steep = (t: number = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, t)
  })
}
