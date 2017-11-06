// @flow

import chromep from './chromePromise'
import {
  OPTIONS_CLICK_BY_LEFT,
  OPTIONS_CLICK_BY_LEFT_CTRL,
  OPTIONS_CLICK_BY_LEFT_SHIFT,
  OPTIONS_CLICK_BY_MIDDLE,
  OPTIONS_DEF_EXPAND,
  OPTIONS_FONT_FAMILY,
  OPTIONS_FONT_SIZE,
  OPTIONS_HIDE_ROOT_FOLDER,
  OPTIONS_MAX_RESULTS,
  OPTIONS_OP_FOLDER_BY,
  OPTIONS_REMEMBER_POS,
  OPTIONS_SEARCH_TARGET,
  OPTIONS_SET_WIDTH,
  OPTIONS_TOOLTIP,
  OPTIONS_WARN_OPEN_MANY,
  ROOT_ID
} from '../constants'

const getMessage = window.chrome.i18n.getMessage

const getOptionsConfig = async (): Promise<Object> => {
  const openBookmarkChoices: string[] = [
    getMessage('clickOption1'),
    getMessage('clickOption2'),
    getMessage('clickOption3'),
    getMessage('clickOption4'),
    getMessage('clickOption5'),
    getMessage('clickOption6'),
    getMessage('clickOption7')
  ]
  const rootFolderChoices: string[] = []

  // get the root folders' title and set as the choices of 'defExpand'
  const rootFolders: Object[] = await chromep.bookmarks.getChildren(ROOT_ID)
  for (const rootFolder of rootFolders) {
    const rootFolderIdNum: number = Number(rootFolder.id)

    rootFolderChoices[rootFolderIdNum] = rootFolder.title
  }

  return {
    [OPTIONS_CLICK_BY_LEFT]: {
      type: 'integer',
      default: 0,
      choices: openBookmarkChoices
    },
    [OPTIONS_CLICK_BY_LEFT_CTRL]: {
      type: 'integer',
      default: 4,
      choices: openBookmarkChoices
    },
    [OPTIONS_CLICK_BY_LEFT_SHIFT]: {
      type: 'integer',
      default: 5,
      choices: openBookmarkChoices
    },
    [OPTIONS_CLICK_BY_MIDDLE]: {
      type: 'integer',
      default: 2,
      choices: openBookmarkChoices
    },
    [OPTIONS_DEF_EXPAND]: {
      type: 'integer',
      default: 1,
      choices: rootFolderChoices
    },
    [OPTIONS_FONT_FAMILY]: {
      type: 'string',
      default: 'sans-serif',
      choices: [
        'monospace',
        'sans-serif',
        'serif',
        'Archivo Narrow',
        'Arial',
        'Comic Sans MS',
        'Georgia',
        'Lucida Sans Unicode',
        'Tahoma',
        'Trebuchet MS',
        'Verdana'
      ]
    },
    [OPTIONS_FONT_SIZE]: {
      type: 'integer',
      default: 12,
      minimum: 10,
      maximum: 30
    },
    [OPTIONS_HIDE_ROOT_FOLDER]: {
      type: 'array',
      default: [],
      choices: rootFolderChoices
    },
    [OPTIONS_MAX_RESULTS]: {
      type: 'integer',
      default: 50,
      minimum: 10,
      maximum: 200
    },
    [OPTIONS_OP_FOLDER_BY]: {
      type: 'boolean',
      default: false
    },
    [OPTIONS_REMEMBER_POS]: {
      type: 'boolean',
      default: false
    },
    [OPTIONS_SEARCH_TARGET]: {
      type: 'integer',
      default: 0,
      choices: [getMessage('searchTargetOption1'), getMessage('searchTargetOption2')]
    },
    [OPTIONS_SET_WIDTH]: {
      type: 'integer',
      default: 280,
      minimum: 100,
      maximum: 399
    },
    [OPTIONS_TOOLTIP]: {
      type: 'boolean',
      default: false
    },
    [OPTIONS_WARN_OPEN_MANY]: {
      type: 'boolean',
      default: true
    }
  }
}

export default getOptionsConfig
