/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */
/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css'
/* Theme variables */
import './theme/variables.css'

import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import eruda from 'eruda'
import { calendarSharp, caretForwardCircleSharp, filmSharp, personCircleSharp } from 'ionicons/icons'
import { useEffect } from 'react'
import { Redirect, Route } from 'react-router-dom'

import History from './pages/history'
import Home from './pages/home'
import View from './pages/home/pages/View'
import My from './pages/my'

setupIonicReact()

const App: React.FC = () => {
  // const pathRoute = useObjAtom(pathRouteState)
  // const directory = useObjAtom(directoryState)
  // const files = useObjAtom(filesState)
  useEffect(() => {
    if (import.meta.env.VITE_APP_ENV !== 'live') eruda.init()
    // pathRoute.set([])
    // directory.set([])
    // files.set([])
  }, [])

  return (
    <IonApp className="app">
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/view">
              <View />
            </Route>
            <Route exact path="/history">
              <History />
            </Route>
            <Route path="/my">
              <My />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom" className="tab-bar">
            <IonTabButton tab="home" href="/">
              <IonIcon aria-hidden="true" icon={caretForwardCircleSharp} />
              <IonLabel>Video</IonLabel>
            </IonTabButton>
            <IonTabButton tab="history" href="/history">
              <IonIcon aria-hidden="true" icon={calendarSharp} />
              <IonLabel>History</IonLabel>
            </IonTabButton>
            <IonTabButton tab="my" href="/my">
              <IonIcon aria-hidden="true" icon={personCircleSharp} />
              <IonLabel>My</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  )
}

export default App
