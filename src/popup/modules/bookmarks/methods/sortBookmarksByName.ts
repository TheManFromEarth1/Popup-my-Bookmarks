import webExtension from 'webextension-polyfill'

import { BOOKMARK_TYPES } from '../../../constants'
import type { BookmarkInfo } from '../../../types'
import sortByTitle from '../../../utils/sortByTitle'
import { getBookmarkInfo, getBookmarkTree } from './getBookmark'

const splitBySeparator = (bookmarkInfos: BookmarkInfo[]): BookmarkInfo[][] => {
  return bookmarkInfos.reduce<BookmarkInfo[][]>(
    (acc, bookmarkInfo) => {
      if (acc.length === 0 || bookmarkInfo.type === BOOKMARK_TYPES.SEPARATOR) {
        acc.push([])
      }

      acc.at(-1)?.push(bookmarkInfo)

      return acc
    },
    [[]],
  )
}

interface BookmarkGroup {
  type: BOOKMARK_TYPES
  members: BookmarkInfo[]
}
const groupByType = (bookmarkInfos: BookmarkInfo[]): BookmarkGroup[] => {
  return bookmarkInfos.reduce<BookmarkGroup[]>((acc, bookmarkInfo) => {
    const matchType = (group: BookmarkGroup) => group.type === bookmarkInfo.type

    if (!acc.some(matchType)) {
      acc.push({
        type: bookmarkInfo.type,
        members: [],
      })
    }

    const matchedGroup = acc.find(matchType)
    if (matchedGroup) {
      matchedGroup.members.push(bookmarkInfo)
    }

    return acc
  }, [])
}

const sortGroupByPriority = (groups: BookmarkGroup[]): BookmarkGroup[] => {
  const priority = [
    BOOKMARK_TYPES.SEPARATOR,
    BOOKMARK_TYPES.FOLDER,
    BOOKMARK_TYPES.BOOKMARK,
  ]
  return Array.from(groups).sort((groupA, groupB) => {
    return priority.indexOf(groupA.type) - priority.indexOf(groupB.type)
  })
}

const mergeGroups = (nestedGroups: BookmarkGroup[][]): BookmarkInfo[] => {
  return nestedGroups
    .map((nestedGroup) => nestedGroup.map((group) => group.members).flat())
    .flat()
}

const sortBookmarks = (bookmarkInfos: BookmarkInfo[]): BookmarkInfo[] => {
  const nestedGroups = splitBySeparator(bookmarkInfos)
    .map(groupByType)
    .map((groups) => {
      return groups.map((group) => ({
        ...group,
        members: sortByTitle(group.members),
      }))
    })
    .map(sortGroupByPriority)
  return mergeGroups(nestedGroups)
}

export default async function sortBookmarksByName(parentId: string) {
  const bookmarkTree = await getBookmarkTree(parentId)

  const sortedBookmarkInfos = sortBookmarks(bookmarkTree.children)

  // Moving bookmarks to sorted index
  for (const [index, bookmarkInfo] of sortedBookmarkInfos.entries()) {
    const currentBookmarkInfo: BookmarkInfo = await getBookmarkInfo(
      bookmarkInfo.id,
    )
    const currentIndex = currentBookmarkInfo.storageIndex
    if (currentIndex !== index) {
      await webExtension.bookmarks.move(bookmarkInfo.id, {
        // if new index is after current index, need to add 1,
        // because index means the position in current array,
        // which also count the current position
        index: index + (index > currentIndex ? 1 : 0),
      })
    }
  }
}
