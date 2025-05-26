import { IonButton, IonButtons, IonContent, IonIcon, IonPage, IonTitle, IonToolbar, useIonViewDidEnter, useIonViewDidLeave, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react'
import { chevronBack, grid, gridOutline, list, reorderThree, sync } from 'ionicons/icons'
import { forwardRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useAsyncFn, useUpdateEffect } from 'react-use'
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso'
import { createClient } from 'webdav'

import file_unknownImg from '@/assets/images/file-unknown.png'
import icon_folderImg from '@/assets/images/icon-folder.png'
import loadingImg from '@/assets/images/loading.png'
import Images from '@/components/Images'
import VideoCover from '@/components/VideoCover'
import useObjAtom from '@/hooks/useObjAtom'
import useObjState from '@/hooks/useObjState'
import { DavFile, directoryState, filesState, pathRouteState } from '@/store/video'
import { steep } from '@/utils'

export const webdavClient = createClient(
  '/webdav' // 替换为你的 WebDAV 服务器地址
)

// export const imgType = ['png', 'jpg', 'jpeg']
export const imgType: string[] = []
export const videoType: string[] = ['mp4']
export const directoryType: string[] = ['directory']
export const isImage = (type: string) => imgType.includes(type)
export const isVideo = (type: string) => videoType.includes(type)
export const isDirectory = (type: string) => directoryType.includes(type)
export const isImgOrVideo = (type: string) => isImage(type) || isVideo(type)
const layoutEnum: {
  list: string
  grid: string
} = {
  list: list,
  grid: gridOutline
}

const isCoverDirectory = (basename: string) => basename === '_cover' || basename === '封面' || basename === 'cover'

export default function Index() {
  const history = useHistory()
  const pathRoute = useObjAtom(pathRouteState)
  const directory = useObjAtom(directoryState)
  const files = useObjAtom(filesState)
  const layout = useObjState<'list' | 'grid'>(localStorage.localLayout || 'list')
  const isGrid = layout.value === 'grid'

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
            if (item.type === 'directory' && !isCoverDirectory(item.basename)) {
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

  const [folderState, folderFetch] = useAsyncFn(async ({ path = '/', deep = false }) => {
    directory.set([])
    files.set([])
    await steep(0)
    const data = await getMP4FilesFromVideoDirectory(path, deep)
    directory.set(data.directory)
    files.set(data.files)
    return data
  }, [])

  useEffect(() => {
    folderFetch({ path: pathRoute.value[pathRoute.value.length - 1] || '/' })
  }, [folderFetch, pathRoute.value])

  useUpdateEffect(() => {
    localStorage.localPathRoute = JSON.stringify(pathRoute.value)
  }, [pathRoute.value])

  useUpdateEffect(() => {
    localStorage.localDirectory = JSON.stringify(directory.value)
  }, [directory.value])

  useUpdateEffect(() => {
    localStorage.localFiles = JSON.stringify(files.value)
  }, [files.value])

  useUpdateEffect(() => {
    localStorage.localLayout = layout.value
  }, [layout.value])

  return (
    <IonPage>
      <IonToolbar style={{ '--background': '#F7F7F7' }}>
        {pathRoute.value.length > 1 && (
          <IonButtons slot="start">
            <IonButton
              onClick={() =>
                pathRoute.set((prev: string[]) => {
                  const newPath = [...prev]
                  newPath.pop()
                  return newPath
                })
              }
            >
              <IonIcon className="text-[#666666]" slot="icon-only" icon={chevronBack}></IonIcon>
            </IonButton>
          </IonButtons>
        )}
        <IonButtons slot="end">
          <IonButton
            onClick={() => {
              // localStorage.removeItem('localPathRoute')
              // localStorage.removeItem('localDirectory')
              // localStorage.removeItem('localFiles')
              // localStorage.removeItem('localViewIndex')
              // window.location.reload()
              layout.set((v) => (v === 'list' ? 'grid' : 'list'))
            }}
          >
            <IonIcon className={`text-[#666666] ${isGrid ? 'text-[24px]!' : 'text-[24px]!'}`} slot="icon-only" icon={layoutEnum[layout.value]}></IonIcon>
          </IonButton>
        </IonButtons>
        <IonTitle className="whitespace-nowrap text-[14px] text-[#444] overflow-hidden text-ellipsis px-[10px]">{pathRoute.value[pathRoute.value.length - 1] || 'webdav'}</IonTitle>
      </IonToolbar>
      <IonContent fullscreen scrollY={false}>
        <div className="overflow-auto h-full">
          {[...directory.value, ...files.value].length ? (
            <VirtuosoGrid
              className="h-full"
              data={[...directory.value, ...files.value]}
              components={{
                List: forwardRef(({ style, children, ...props }: any, ref) => (
                  <div
                    ref={ref}
                    {...props}
                    style={{
                      display: 'flex',
                      margin: isGrid ? '10px 0 0 0' : '5px 0',
                      flexWrap: 'wrap',
                      ...style
                    }}
                  >
                    {children}
                  </div>
                )),
                Item: ({ children, ...props }) => (
                  <div
                    {...props}
                    className={!isGrid ? 'last:mb-[5px]!' : ''}
                    style={{
                      width: isGrid ? 'auto' : '100%',
                      margin: isGrid ? '0 0 10px 10px' : '0',
                      display: 'flex',
                      flex: isGrid ? '0 0 calc(50% - 15px)' : 'none',
                      alignContent: 'stretch',
                      boxSizing: 'border-box'
                    }}
                  >
                    {children}
                  </div>
                )
              }}
              itemContent={(_, item) => (
                <div
                  key={item.basename}
                  onClick={() => {
                    if (item.type === 'directory') {
                      pathRoute.set((prev: string[]) => {
                        const newPath = [...prev]
                        newPath.includes(item.filename) || newPath.push(item.filename)
                        return newPath
                      })
                    } else {
                      const index = _ - directory.value.length
                      localStorage.localViewIndex = index
                      history.push(`/home/view?index=${index}`)
                    }
                  }}
                  className={`w-full flex justify-center items-center relative overflow-hidden ${!isGrid ? 'mx-[10px] py-[5px]' : 'rounded-[6px] flex-col'}`}
                >
                  <div className={`bg-[#f7f7f7] ${isGrid ? 'w-full h-[260px] flex justify-center items-center' : 'w-[30px] h-[30px] mr-[5px] rounded-[4px] overflow-hidden'}`}>
                    {(() => {
                      if (item.type === 'directory') {
                        return <img className="w-full h-full object-contain" src={icon_folderImg} />
                      }
                      if (!item.url) {
                        return <img className="w-full h-full object-contain" src={file_unknownImg} />
                      }
                      if (isImage(item.type)) {
                        return <Images url={item.url} />
                      }
                      if (isVideo(item.type)) {
                        return <VideoCover url={item.url || ''} />
                      }
                      return <img className="w-full h-full object-contain" src={file_unknownImg} />
                    })()}
                  </div>
                  <div
                    className={`text-[14px] whitespace-nowrap overflow-hidden text-ellipsis ${isGrid ? 'absolute z-20 bottom-0 px-[10px] w-full text-center text-[#333] bg-white/40 py-[5px] backdrop-blur-sm' : 'flex-1 text-[#444]'}`}
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
                  <img className="w-[30px] h-[30px] animate-[spin_5s_linear_infinite]" src={loadingImg} alt="" />
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
