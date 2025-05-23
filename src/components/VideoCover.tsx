import { memo, useEffect, useState } from 'react'

import loadingImg from '@/assets/images/loading.png'
import { webdavClient } from '@/pages/home'
import { getVideoCoverBase64 } from '@/utils'

interface VideoCoverProps {
  url: string
}

function VideoCover({ url }: VideoCoverProps) {
  const [cover, setCover] = useState<string>('')
  console.log('VideoCover', url)
  useEffect(() => {
    const tryGetCover = async () => {
      try {
        // 获取视频所在目录和文件名
        const videoDir = url.substring(0, url.lastIndexOf('/'))
        const videoName = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'))
        const coverPath = `${videoDir}/${videoName}.jpg`

        try {
          // 使用 stat 方法检查文件是否存在
          await webdavClient.stat(coverPath)
          setCover('/webdav' + coverPath)
          return
        } catch (error) {
          // 如果文件不存在，生成并保存封面
          const result = await getVideoCoverBase64({
            source: '/webdav' + url,
            maxSide: 360
          })

          // 将 base64 转换为 ArrayBuffer
          const base64Data = result.base64.split(',')[1]
          const binaryData = atob(base64Data)
          const bytes = new Uint8Array(binaryData.length)
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i)
          }

          // 保存到 WebDAV
          await webdavClient.putFileContents(coverPath, bytes.buffer)

          // 设置封面
          setCover(result.base64)
        }
      } catch (error) {
        console.error('Error handling video cover:', error)
      }
    }

    tryGetCover()
  }, [url])

  return <img className={`object-cover ${!cover ? 'animate-[spin_5s_linear_infinite] w-[30px] h-[30px]' : 'w-full h-full'}`} src={cover || loadingImg} alt="" />
}

export default memo(VideoCover)
