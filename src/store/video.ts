import { atom } from 'jotai'

export type DavFile = {
  filename: string
  basename: string
  lastmod: string
  size: number
  type: string
  etag: string
  mime: string
  title?: string
  indexTitle: string
  url?: string
  // index?: number
}

const localPathRoute: string[] = JSON.parse(localStorage.localPathRoute || '["/"]')
const localDirectory: DavFile[] = JSON.parse(localStorage.localDirectory || '[]')
const localFiles: DavFile[] = JSON.parse(localStorage.localFiles || '[]')

export const pathRouteState = atom<string[]>(localPathRoute)
export const directoryState = atom<DavFile[]>(localDirectory)
export const filesState = atom<DavFile[]>(localFiles)
