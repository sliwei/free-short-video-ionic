import { IonButton, IonButtons, IonContent, IonIcon, IonPage, IonTitle, IonToolbar, useIonViewDidEnter, useIonViewDidLeave, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react'
import { chevronBack, ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons'
import path from 'path'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { Virtuoso } from 'react-virtuoso'
import { createClient } from 'webdav'

import file_unknownImg from '@/assets/images/file-unknown.png'
import icon_folderImg from '@/assets/images/icon-folder.png'
import loadingImg from '@/assets/images/loading.png'
import Images from '@/components/Images'
import VideoCover from '@/components/VideoCover'
import useObjAtom from '@/hooks/useObjAtom'
import { DavFile, directoryState, filesState } from '@/store/video'
import { steep } from '@/utils'

export const webdavClient = createClient(
  '/webdav' // 替换为你的 WebDAV 服务器地址
)

export const imgType = ['png', 'jpg', 'jpeg']
export const videoType = ['mp4']
export const directoryType = ['directory']
export const isImage = (type: string) => imgType.includes(type)
export const isVideo = (type: string) => videoType.includes(type)
export const isDirectory = (type: string) => directoryType.includes(type)
export const isImgOrVideo = (type: string) => isImage(type) || isVideo(type)

export default function Index() {
  const history = useHistory()
  const [pathRoute, setPathRoute] = useState<string[]>([])
  const directory = useObjAtom(directoryState)
  const files = useObjAtom(filesState)

  useIonViewDidEnter(() => {})
  useIonViewDidLeave(() => {})
  useIonViewWillEnter(() => {})
  useIonViewWillLeave(() => {})

  const getMP4FilesFromVideoDirectory = async (path: string, deep: boolean = false) => {
    const directory: DavFile[] = []
    const files: DavFile[] = []

    // 递归获取目录下的所有 MP4 文件
    const traverseDirectory = async (currentPath: string) => {
      const path = currentPath.replace(/\/../, '')
      try {
        const contents = await webdavClient.getDirectoryContents(path)
        for (const item of contents as DavFile[]) {
          if (item.filename !== currentPath && item.basename !== '.DS_Store') {
            const type = item.basename.split('.').pop() || 'file'
            if (item.type === 'directory') {
              directory.push({
                ...item,
                type: 'directory'
              })
              deep && (await traverseDirectory(item.filename))
            } else if (isImgOrVideo(type)) {
              const url = item.filename.replace(/\/../, '')
              files.push({
                ...item,
                title: url.replace('.mp4', ''),
                indexTitle: item.basename,
                url: url,
                // 获取后缀
                type
              })
            }
          }
        }
      } catch (error) {
        console.error(`Error accessing directory ${path}:`, error)
      }
    }

    await traverseDirectory(path)

    // 按照名字排序,名字是数字
    const fixFiles = files.sort((a, b) => {
      const aIndex = parseInt(a.indexTitle.replace('.mp4', ''))
      const bIndex = parseInt(b.indexTitle.replace('.mp4', ''))
      return aIndex - bIndex
    })

    return {
      directory: directory.filter((item) => item.basename !== '..'),
      files: fixFiles.filter((item) => item.basename !== '..')
    }
  }

  const [folderState, folderFetch] = useAsyncFn(async ({ path = '/', deep = false, ret = false }) => {
    directory.set([])
    files.set([])
    await steep(0)
    if (ret) {
      // 如果是返回上一级目录
      setPathRoute((prev: string[]) => {
        const newPath = [...prev]
        newPath.pop()
        return newPath
      })
    } else {
      setPathRoute((prev: string[]) => {
        const newPath = [...prev]
        newPath.push(path)
        return newPath
      })
    }
    const data = await getMP4FilesFromVideoDirectory(path, deep)
    directory.set(data.directory)
    files.set(data.files)
    return data
  }, [])

  useEffect(() => {
    folderFetch({ path: '/' })
  }, [folderFetch])

  // console.log('directory.value', directory.value)
  // console.log('files.value', files.value)

  return (
    <IonPage>
      <IonToolbar>
        {pathRoute.length > 1 && (
          <IonButtons slot="start">
            <IonButton
              onClick={() =>
                folderFetch({
                  path: pathRoute[pathRoute.length - 2],
                  ret: true
                })
              }
            >
              <IonIcon slot="icon-only" icon={chevronBack}></IonIcon>
            </IonButton>
          </IonButtons>
        )}
        {/* <IonButtons slot="end">
            <IonButton>
              <IonIcon slot="icon-only" ios={ellipsisHorizontal} md={ellipsisVertical}></IonIcon>
            </IonButton>
          </IonButtons> */}
        <IonTitle className="whitespace-nowrap text-[14px] overflow-hidden text-ellipsis">{pathRoute[pathRoute.length - 1]?.replace(/\/../, '')?.replace(/\//, '') || 'webdav'}</IonTitle>
      </IonToolbar>
      <IonContent fullscreen scrollY={false}>
        <div className="overflow-auto h-full">
          {[...directory.value, ...files.value].length ? (
            <Virtuoso
              style={{ height: '100%' }}
              data={[...directory.value, ...files.value]}
              itemContent={(_, item) => (
                <div className="mx-[10px] p-[10px_0] flex justify-center items-center" key={item.basename}>
                  <div className="w-[30px] h-[30px] mr-[5px]">
                    {(() => {
                      if (item.type === 'directory') {
                        return <img className="w-full h-full" src={icon_folderImg} />
                      }
                      if (!item.url) {
                        return <img className="w-full h-full" src={file_unknownImg} />
                      }
                      if (isImage(item.type)) {
                        return <Images url={item.url} />
                      }
                      if (isVideo(item.type)) {
                        return <VideoCover url={item.url || ''} />
                      }
                      return <img className="w-full h-full" src={file_unknownImg} />
                    })()}
                  </div>
                  <div
                    onClick={() => {
                      if (item.type === 'directory') {
                        folderFetch({ path: item.filename })
                      } else {
                        history.push(`/view?index=${_ - directory.value.length}`)
                      }
                    }}
                    className="flex-1 whitespace-nowrap text-[14px] overflow-hidden text-ellipsis"
                  >
                    {item.basename}
                  </div>
                </div>
              )}
            />
          ) : (
            <>
              {folderState.loading ? (
                <div className="text-[14px] text-center py-[10px] flex justify-center items-center">
                  <img className="w-[30px] h-[30px] animate-[spin_3s_linear_infinite]" src={loadingImg} alt="" />
                </div>
              ) : (
                <div className="text-[14px] text-center py-[10px]">Nothing!</div>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
