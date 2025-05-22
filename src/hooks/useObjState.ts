import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useRef, useState } from 'react'

type GetStateAction<S> = () => S

function useObjState<S>(initialState: S | (() => S)): {
  value: S
  set: Dispatch<SetStateAction<S>>
  get: GetStateAction<S>
}
function useObjState<S = undefined>(): {
  value: S | undefined
  set: Dispatch<SetStateAction<S | undefined>>
  get: GetStateAction<S | undefined>
}
function useObjState<S>(initialState?: S) {
  const [state, setState] = useState(initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  const getState = useCallback(() => stateRef.current, [])

  return { value: state, set: setState, get: getState }
}

export default useObjState
