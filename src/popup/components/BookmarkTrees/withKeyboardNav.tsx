import type * as React from 'react'
import { useSelector } from 'react-redux'

import useAction from '../../../core/hooks/useAction'
import { BOOKMARK_TYPES } from '../../constants'
import { BASE_WINDOW } from '../../constants/windows'
import { useOptions } from '../../modules/options'
import type { RootState } from '../../reduxs'
import { bookmarkCreators } from '../../reduxs'
import {
  getClickOptionNameByEvent,
  mapOptionToOpenBookmarkProps,
} from '../../utils/clickBookmarkUtils'
import getLastMapKey from '../../utils/getLastMapKey'
import isMac from '../../utils/isMac'
import { openBookmarksInBrowser } from '../../utils/openBookmarkUtils'
import { useKeyBindingsEvent } from '../keyBindings'
import {
  ListNavigationProvider,
  useKeyboardNav,
  useListNavigationContext,
} from '../listNavigation'
import { useMenuContext } from '../menu'

const useArrowKeysNav = () => {
  const trees = useSelector((state: RootState) => state.bookmark.trees)

  const openBookmarkTree = useAction(bookmarkCreators.openBookmarkTree)
  const removeNextBookmarkTrees = useAction(
    bookmarkCreators.removeNextBookmarkTrees,
  )

  const { listNavigation } = useListNavigationContext()

  useKeyboardNav({
    windowId: BASE_WINDOW,
    onPressArrowLeft() {
      // at least we need one tree
      if (trees.length > 1) {
        const secondLastTree = trees[trees.length - 2]

        removeNextBookmarkTrees(secondLastTree.parent.id)
      }
    },
    onPressArrowRight() {
      const { highlightedIndices, itemCounts } = listNavigation

      const lastListIndex = getLastMapKey(itemCounts)
      if (lastListIndex === undefined) return
      const treeInfo = trees[lastListIndex]
      if (!treeInfo) return

      const highlightedIndex = highlightedIndices.get(lastListIndex)
      if (highlightedIndex === undefined) return
      const bookmarkInfo = treeInfo.children[highlightedIndex]
      if (!bookmarkInfo) return

      if (bookmarkInfo.type === BOOKMARK_TYPES.FOLDER) {
        openBookmarkTree(bookmarkInfo.id, treeInfo.parent.id)
      }
    },
  })
}

const useEnterKeyNav = () => {
  const options = useOptions()
  const trees = useSelector((state: RootState) => state.bookmark.trees)

  const { listNavigation } = useListNavigationContext()

  useKeyBindingsEvent({ key: 'Enter', windowId: BASE_WINDOW }, async (evt) => {
    const { highlightedIndices, itemCounts } = listNavigation

    const lastListIndex = getLastMapKey(itemCounts)
    if (lastListIndex === undefined) return
    const treeInfo = trees[lastListIndex]
    if (!treeInfo) return

    // default open first bookmark in last tree
    const highlightedIndex = highlightedIndices.get(lastListIndex) ?? 0
    const bookmarkInfo = treeInfo.children[highlightedIndex]
    if (!bookmarkInfo) return

    const option = options[getClickOptionNameByEvent(evt)]
    const openBookmarkProps = mapOptionToOpenBookmarkProps(option)
    await openBookmarksInBrowser([bookmarkInfo.id], {
      ...openBookmarkProps,
      isAllowBookmarklet: true,
    })
  })
}

const useMenuKeyNav = () => {
  const trees = useSelector((state: RootState) => state.bookmark.trees)

  const { open: openMenu } = useMenuContext()

  const { listNavigation } = useListNavigationContext()

  useKeyBindingsEvent(
    {
      key: isMac() ? 'Control' : 'ContextMenu',
      windowId: BASE_WINDOW,
    },
    () => {
      const { highlightedIndices, itemCounts } = listNavigation

      const lastListIndex = getLastMapKey(itemCounts)
      if (lastListIndex === undefined) return
      const treeInfo = trees[lastListIndex]
      if (!treeInfo) return

      const highlightedIndex = highlightedIndices.get(lastListIndex)
      if (highlightedIndex === undefined) return
      const bookmarkInfo = treeInfo.children[highlightedIndex]
      if (!bookmarkInfo) return

      const offset = document
        .querySelector(`[data-bookmarkid="${bookmarkInfo.id}"`)
        ?.getBoundingClientRect()
      const targetPositions = {
        top: offset?.top ?? 0,
        left: offset?.left ?? 0,
      }
      openMenu({
        targetId: bookmarkInfo.id,
        displayPositions: targetPositions,
        targetPositions,
      })
    },
  )
}

export default function withKeyboardNav<P>(
  WrappedComponent: React.ComponentType<P>,
) {
  const InnerComponent = (props: P) => {
    useArrowKeysNav()
    useEnterKeyNav()
    useMenuKeyNav()

    return <WrappedComponent {...props} />
  }

  return function ComponentWithKeyboardNav(props: P) {
    return (
      <ListNavigationProvider>
        <InnerComponent {...props} />
      </ListNavigationProvider>
    )
  }
}
