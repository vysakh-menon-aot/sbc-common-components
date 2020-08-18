import ConfigHelper from './config-helper'
import { SessionStorageKeys } from './constants'

/**
 * Place to put all the custom utility methods
 */
export function getBoolean (value: boolean | string | number): boolean {
  var resultVal = value
  if (typeof value === 'string') {
    resultVal = value.toLowerCase()
  }
  switch (resultVal) {
    case true:
    case 'true':
    case 1:
    case '1':
    case 'on':
    case 'yes':
    case 'none':
      return true
    default:
      return false
  }
}

export function decodeKCToken () {
  try {
    const token = ConfigHelper.getFromSession(SessionStorageKeys.KeyCloakToken)
    if (token) {
      const base64Url = token.split('.')[1]
      const base64 = decodeURIComponent(window.atob(base64Url).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(base64)
    } else {
      return {}
    }
  } catch (error) {
    throw new Error('Error parsing JWT - ' + error)
  }
}

export function trimTrailingSlashURL (url) {
  return (url) ? url.trim().replace(/\/+$/, '') : ''
}
