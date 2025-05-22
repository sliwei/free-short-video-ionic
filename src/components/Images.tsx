import Artplayer from 'artplayer'
import { useEffect, useRef, useState } from 'react'

import loadingImg from '@/assets/images/loading.png'
import { webdavClient } from '@/pages/home'

type ImagesProps = {
  url: string
}

export default function Images({ url }: ImagesProps) {
  const [blobUrl, setBlobUrl] = useState('')

  useEffect(() => {
    webdavClient.getFileContents(url).then((res: any) => {
      const blob = new Blob([res], { type: 'image/jpg' })
      setBlobUrl(URL.createObjectURL(blob))
    })
  }, [])

  return <img src={blobUrl || loadingImg} className={`w-full h-full object-contain ${!blobUrl ? 'animate-[spin_3s_linear_infinite]' : ''}`} alt="" />
}
