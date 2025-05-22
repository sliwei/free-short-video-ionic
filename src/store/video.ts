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

export const directoryState = atom<DavFile[]>([])
export const filesState = atom<DavFile[]>([])
