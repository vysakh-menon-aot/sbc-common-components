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

  initUsingUrl (keyCloakConfigurl: string) {
    var self = this

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
      this.kc.init(kcOptions
      ).success(function (authenticated) {
        console.info('[TokenServices] is User Authenticated:Syncing' + authenticated)
        self.syncSessionStorage()
        if (self.kc) {
          resolve(self.kc.token)
        } else {
          reject(new Error('Could not Initialise KC'))
        }
      }).error(function (err) {
        reject(new Error('Could not Initialise KC' + err))
      })
    })
  }

  scheduleRefreshTimer (refreshEarlyTime :number = 0) {
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
            // this.cleanupSession()
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

  private scheduleRefreshToken (refreshEarlyTimeinMilliseconds:number) {
    let self = this
    let refreshTokenExpiresIn = -1
    // check if refresh token is still valid . Or else clear all timers and throw errors
    if (self.kc !== undefined && self.kc.timeSkew !== undefined && self.kc.refreshTokenParsed !== undefined) {
      refreshTokenExpiresIn = self.kc.refreshTokenParsed['exp']! - Math.ceil(new Date().getTime() / 1000) + self.kc.timeSkew
    }
    if (refreshTokenExpiresIn < 0) {
      throw new Error('Refresh Token Expired..No more token refreshes')
    }
    let expiresIn = -1
    if (self.kc !== undefined && self.kc.tokenParsed !== undefined && self.kc.tokenParsed['exp'] !== undefined && self.kc.timeSkew !== undefined) {
      expiresIn = self.kc.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + self.kc.timeSkew
    }
    if (expiresIn < 0) {
      throw new Error('Refresh Token Expired..No more token refreshes')
    }
    let refreshInMilliSeconds = (expiresIn * 1000) - refreshEarlyTimeinMilliseconds // in milliseconds
    console.info('[TokenServices] Token Refreshal Scheduled in %s Seconds', (refreshInMilliSeconds / 1000))
    this.timerId = setTimeout(() => {
      console.log('[TokenServices] Refreshing Token Attempt: %s ', ++this.counter)
      this.kc!.updateToken(-1)
        .success(refreshed => {
          if (refreshed) {
            console.log('successfully refreshed')
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
      if (this.kc.token != null) {
        sessionStorage.setItem('KEYCLOAK_TOKEN', this.kc.token)
      }
      if (this.kc.refreshToken != null) {
        sessionStorage.setItem('KEYCLOAK_REFRESH_TOKEN', this.kc.refreshToken)
      }
      if (this.kc.idToken != null) {
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
