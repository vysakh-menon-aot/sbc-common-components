import Keycloak, { KeycloakInitOptions, KeycloakInstance } from 'keycloak-js'

class TokenServices {
  private kc: KeycloakInstance | undefined
  private static instance: TokenServices
  private counter = 0
  private REFRESH_ATTEMPT_INTERVAL = 10 // in seconds
  private timerId = 0

  initUsingKc (kcInstance: KeycloakInstance) {
    this.kc = kcInstance
  }

  async initUsingUrl (keyCloakConfigurl: string) {
    const kcOptions: KeycloakInitOptions = {
      onLoad: 'login-required',
      checkLoginIframe: false,
      timeSkew: 0,
      token: sessionStorage.getItem('KEYCLOAK_TOKEN') || undefined,
      refreshToken: sessionStorage.getItem('KEYCLOAK_REFRESH_TOKEN') || undefined,
      idToken: sessionStorage.getItem('KEYCLOAK_ID_TOKEN') || undefined
    }

    return new Promise((resolve, reject) => {
      this.kc = Keycloak(keyCloakConfigurl)
      this.kc.init(kcOptions)
        .success(authenticated => {
          console.info('[TokenServices] is User Authenticated?: Syncing ' + authenticated)
          const preventStorageSync = sessionStorage.getItem('PREVENT_STORAGE_SYNC') || false
          if (this.kc) {
            if (!preventStorageSync) {
              this.syncSessionStorage()
            }
            sessionStorage.removeItem('PREVENT_STORAGE_SYNC')
            resolve(this.kc.token)
          } else {
            reject(new Error('Could not Initialize KC'))
          }
        })
        .error(error => {
          reject(new Error('Could not Initialize KC' + error))
        })
    })
  }

  scheduleRefreshTimer (refreshEarlyTime = 0) {
    let refreshEarlyTimeinMilliseconds = Math.max(this.REFRESH_ATTEMPT_INTERVAL, refreshEarlyTime) * 1000
    this.scheduleRefreshToken(refreshEarlyTimeinMilliseconds)
  }

  refreshToken () {
    console.log('[TokenServices] One time Token Refreshing ')
    return new Promise((resolve, reject) => {
      if (this.kc) {
        this.kc.updateToken(-1)
          .success(refreshed => {
            if (refreshed) {
              console.log('[TokenServices] One time Token Refreshed ')
              this.syncSessionStorage()
              resolve()
            }
          })
          .error(() => {
            reject(new Error('Could not refresh Token'))
          })
      } else {
        reject(new Error('Could not refresh Token:No Kc Instance'))
      }
    })
  }

  stopRefreshTimer () {
    console.info('[TokenServices Stopping the timer] ')
    clearTimeout(this.timerId)
  }

  private scheduleRefreshToken (refreshEarlyTimeinMilliseconds: number) {
    let refreshTokenExpiresIn = -1
    // check if refresh token is still valid . Or else clear all timers and throw errors
    if (this.kc && this.kc.timeSkew && this.kc.refreshTokenParsed) {
      refreshTokenExpiresIn = this.kc.refreshTokenParsed['exp']! - Math.ceil(new Date().getTime() / 1000) + this.kc.timeSkew
    }
    if (refreshTokenExpiresIn < 0) {
      throw new Error('Refresh Token Expired. No more token refreshes')
    }
    let expiresIn = -1
    if (this.kc && this.kc.tokenParsed && this.kc.tokenParsed['exp'] && this.kc.timeSkew) {
      expiresIn = this.kc.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + this.kc.timeSkew
    }
    if (expiresIn < 0) {
      throw new Error('Refresh Token Expired. No more token refreshes')
    }
    let refreshInMilliSeconds = (expiresIn * 1000) - refreshEarlyTimeinMilliseconds // in milliseconds
    console.info('[TokenServices] Token Refresh Scheduled in %s Seconds', (refreshInMilliSeconds / 1000))
    this.timerId = setTimeout(() => {
      console.log('[TokenServices] Refreshing Token Attempt: %s ', ++this.counter)
      this.kc!.updateToken(-1)
        .success(refreshed => {
          if (refreshed) {
            console.log('Token successfully refreshed')
            this.syncSessionStorage()
            this.scheduleRefreshToken(refreshEarlyTimeinMilliseconds)
          }
        })
        .error(() => {
          clearTimeout(this.timerId)
        })
    }, refreshInMilliSeconds)
  }

  private syncSessionStorage () {
    if (this.kc) {
      if (this.kc.token) {
        sessionStorage.setItem('KEYCLOAK_TOKEN', this.kc.token)
      }
      if (this.kc.refreshToken) {
        sessionStorage.setItem('KEYCLOAK_REFRESH_TOKEN', this.kc.refreshToken)
      }
      if (this.kc.idToken) {
        sessionStorage.setItem('KEYCLOAK_ID_TOKEN', this.kc.idToken)
      }
    }
  }

  decodeToken () {
    try {
      let token = sessionStorage.getItem('KEYCLOAK_TOKEN')
      if (token != null) {
        const base64Url = token.split('.')[1]
        const base64 = decodeURIComponent(window.atob(base64Url).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(base64)
      } else {
        throw new Error('null JWT')
      }
    } catch (error) {
      throw new Error('Error parsing JWT - ' + error)
    }
  }
}

export default TokenServices
