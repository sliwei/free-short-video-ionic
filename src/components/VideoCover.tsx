import { memo, useEffect, useState } from 'react'

import loadingImg from '@/assets/images/loading.png'
import useObjState from '@/hooks/useObjState'
import { webdavClient } from '@/pages/home'
import { VideoCoverExtractor } from '@/utils'

// 添加封面缓存
const coverCache = new Map<string, string>()

interface VideoCoverProps {
  url: string
}

function VideoCover({ url }: VideoCoverProps) {
  const cover = useObjState<string>('')
  const load = useObjState(false)

  useEffect(() => {
    let extractor = null as VideoCoverExtractor | null
    const tryGetCover = async () => {
      try {
        // 获取视频所在目录和文件名
        const videoDir = url.substring(0, url.lastIndexOf('/'))
        const videoName = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'))
        const coverDir = `${videoDir}/cover`
        const coverPath = `${coverDir}/${videoName}.jpg`

        // 检查缓存
        const cacheKey = `/webdav${coverPath}`
        if (coverCache.has(cacheKey)) {
          cover.set(coverCache.get(cacheKey)!)
          load.set(true)
          return
        }

        try {
          // 使用 stat 方法检查文件是否存在
          await webdavClient.stat(coverPath)
          const coverUrl = '/webdav' + coverPath
          cover.set(coverUrl)
          coverCache.set(cacheKey, coverUrl)
          load.set(true)
          return
        } catch (error) {
          // 如果文件不存在，生成并保存封面
          extractor = new VideoCoverExtractor({
            source: '/webdav' + url,
            currentTime: 1,
            timeout: 5000 // 减少超时时间
          })

          const result = await extractor.getBase64()

          // 设置封面
          cover.set(result.base64)
          coverCache.set(cacheKey, result.base64)

          // 将 base64 转换为 ArrayBuffer
          const base64Data = result.base64.split(',')[1]
          const binaryData = atob(base64Data)
          const bytes = new Uint8Array(binaryData.length)
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i)
          }

          // 先判断是否有coverDir，没有创建这个目录
          try {
            await webdavClient.stat(coverDir)
          } catch (e) {
            // 如果目录不存在，创建目录
            await webdavClient.createDirectory(coverDir)
          }

          // 保存到 WebDAV
          webdavClient.putFileContents(coverPath, bytes.buffer)

          load.set(true)
        }
      } catch (error) {
        console.error('Error handling video cover:', error)
      }
    }

    tryGetCover()

    return () => {
      extractor?.cancel()
    }
  }, [url])

  return (
    <div className="w-full h-full relative overflow-hidden">
      {!load.value ? (
        <div className="w-full h-full bg-[#f7f7f7] absolute z-10 top-0 left-0 flex items-center justify-center">
          <img className="object-cover animate-[spin_5s_linear_infinite] w-[30px] h-[30px]" src={loadingImg} alt="" />
        </div>
      ) : null}
      {cover.value ? <img onLoad={() => load.set(true)} className="object-cover w-full h-full" src={cover.value} alt="" /> : null}
    </div>
  )
}

export default memo(VideoCover)
