import { useEffect, useState } from 'react'

import loadingImg from '@/assets/images/loading.png'
import { webdavClient } from '@/pages/home'
import { getVideoCoverBase64 } from '@/utils'

interface VideoCoverProps {
  url: string
}

export default function VideoCover({ url }: VideoCoverProps) {
  const [cover, setCover] = useState<string>(localStorage.getItem(`video_cover_${url}`) || '')

  useEffect(() => {
    webdavClient.getFileContents(url).then((res: any) => {
      const blob = new Blob([res], { type: 'video/mp4' })
      const blobUrl = URL.createObjectURL(blob)
      getVideoCoverBase64({
        source: blobUrl,
        maxSide: 200
      }).then((res) => {
        setCover(res.base64)
        localStorage.setItem(`video_cover_${url}`, res.base64)
      })
    })
  }, [])

  return <img className={`w-full h-full object-cover ${!cover ? 'animate-[spin_3s_linear_infinite]' : ''}`} src={cover || loadingImg} alt="" />
}
