import { useEffect, useState } from 'react'

import ic_img100Img from '@/assets/images/ic_img100.svg'
import loadingImg from '@/assets/images/loading.png'
import { webdavClient } from '@/pages/home'
import { getVideoCoverBase64 } from '@/utils'

interface VideoCoverProps {
  url: string
}

export default function VideoCover({ url }: VideoCoverProps) {
  const [cover, setCover] = useState<string>(localStorage.getItem(`video_cover_${url}`) || '')

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 3
    const ranges = [
      'bytes=0-2097152' // 2MB
    ]

    const tryGetCover = async () => {
      try {
        const range = ranges[retryCount]
        const res = await webdavClient.getFileContents(url, { headers: { Range: range } })
        const blob = new Blob([res as BlobPart], { type: 'video/mp4' })
        const blobUrl = URL.createObjectURL(blob)

        try {
          const result = await getVideoCoverBase64({
            source: blobUrl,
            maxSide: 200
          })
          setCover(result.base64)
          localStorage.setItem(`video_cover_${url}`, result.base64)
        } catch (error) {
          if (retryCount < maxRetries - 1) {
            retryCount++
            await tryGetCover()
          } else {
            setCover(ic_img100Img)
          }
        } finally {
          URL.revokeObjectURL(blobUrl)
        }
      } catch (error) {
        if (retryCount < maxRetries - 1) {
          retryCount++
          await tryGetCover()
        } else {
          setCover(ic_img100Img)
        }
      }
    }

    tryGetCover()
  }, [url])

  return <img className={`w-full h-full object-cover ${!cover ? 'animate-[spin_3s_linear_infinite]' : ''}`} src={cover || loadingImg} alt="" />
}
