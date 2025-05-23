import 'swiper/css'

import { IonContent, IonFab, IonIcon, IonPage, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react'
import { chevronBack } from 'ionicons/icons'
import { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Virtual } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import unknownImg from '@/assets/images/unknown.svg'
import Images from '@/components/Images'
import Player from '@/components/Player'
import useObjAtom from '@/hooks/useObjAtom'
import { filesState } from '@/store/video'

import { isImage, isVideo } from '..'

export default function Index() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const [realIndex, setRealIndex] = useState(localStorage.localViewIndex || Number(queryParams.get('index')))
  const files = useObjAtom(filesState)
  const [paused, setPaused] = useState(false)
  const history = useHistory()

  useIonViewDidEnter(() => {
    setPaused(false)
  })

  useIonViewDidLeave(() => {
    setPaused(true)
  })

  const onSwiperInit = (swiper: any) => {
    swiper.slideTo(realIndex, 0, false)
  }

  return (
    <>
      <IonPage id="main-content">
        <IonContent fullscreen>
          <div className="h-full overflow-hidden">
            <Swiper
              onSwiper={onSwiperInit}
              className="w-full h-full"
              modules={[Virtual]}
              slidesPerView={1}
              centeredSlides={true}
              pagination={{
                type: 'fraction'
              }}
              direction={'vertical'}
              navigation={true}
              virtual
              onSlideChange={(e) => {
                // 修改地址栏参数index={e.realIndex}
                localStorage.localViewIndex = e.realIndex
                setRealIndex(e.realIndex)
              }}
            >
              {files.value.map((item, index) => (
                <SwiperSlide key={index} virtualIndex={index} className="">
                  <div className="w-full h-full bg-black">
                    <IonFab className="z-[9999]">
                      <div className="w-full h-[40px] flex justify-center items-center mt-[10px]">
                        <div onClick={() => history.goBack()} className="w-[40px] h-[40px] flex justify-center items-center active:scale-90 transition cursor-pointer">
                          <IonIcon className="text-[30px] text-white" icon={chevronBack} />
                        </div>
                        <div className="text-white text-[14px] bottom-[5px] left-[5px]">{item.indexTitle}</div>
                      </div>
                    </IonFab>
                    {(() => {
                      if (!item.url) {
                        return (
                          <div className="w-full h-full flex justify-center items-center">
                            <img className="w-[100px]" src={unknownImg} />
                          </div>
                        )
                      }
                      if (isImage(item.type)) {
                        return <Images url={item.url} />
                      }
                      if (isVideo(item.type)) {
                        return (
                          <Player
                            url={item.url}
                            index={index}
                            realIndex={realIndex}
                            paused={paused}
                            className="w-full h-full"
                            // getInstance={(art) => (videosRef.current[index] = art)}
                          />
                        )
                      }
                      return (
                        <div className="w-full h-full flex justify-center items-center">
                          <img className="w-[100px]" src={unknownImg} />
                        </div>
                      )
                    })()}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </IonContent>
      </IonPage>
    </>
  )
}

// {/* {isLogin ? ( */}

// ) : (
//   <IonList style={{ margin: 20 }}>
//     <IonItem>
//       <IonInput onChange={(e) => setUsername((e.target as HTMLInputElement).value)} label="webdav" labelPlacement="stacked" clearInput={true} placeholder="地址" value={webdav}></IonInput>
//     </IonItem>

//     <IonItem>
//       <IonInput
//         onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
//         label="username"
//         labelPlacement="stacked"
//         clearInput={true}
//         placeholder="用户"
//         value={username}
//       ></IonInput>
//     </IonItem>

//     <IonItem>
//       <IonInput
//         onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
//         label="password"
//         labelPlacement="stacked"
//         type="password"
//         clearInput={true}
//         placeholder="密码"
//         value={password}
//       ></IonInput>
//     </IonItem>

//     <IonButton
//       style={{ marginTop: 20 }}
//       expand="block"
//       size="small"
//       onClick={async () => {
//         console.log('username', username, password)
//         if (username && password) {
//           setIsLogin(true)
//           localStorage.username = username
//           localStorage.password = password
//         }
//       }}
//     >
//       登录
//     </IonButton>
//   </IonList>
// )}
