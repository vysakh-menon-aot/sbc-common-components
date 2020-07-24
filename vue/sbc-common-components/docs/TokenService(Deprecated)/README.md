# TokenService (Deprecated)

This is an abstraction over they keycloak javascript adapter providing some methods to refresh the token.
The abstraction is provided so that COOPS-UI project or any other consumer of auth-web can stay independent of keycloak logic.


It supports two modes for **refreshing the token**



### Timer Mode
   
   In this case , it runs a timer [a plain old javascript settimeout] . It calculates the expiry of current keycloak token and schedules a timeout before 2 seconds of expiry
   Since the timers get destroyed on page refresh , execute the logic in start up or when user signs in
   
   A sample usage:
   
   1. Register the compoent in vue
        
        `private tokenService = new TokenService()`
  
   2. Initialize [keycloak config](../Signin/README.md#keycloak-initialization)

   3. Init the tokenservice so that keycloak service is being set up

   4. Start the timer
    
        ```js
        if (ConfigHelper.getFromSession(SessionStorageKeys.KeyCloakToken)) {
          await this.tokenService.init()
          this.tokenService.scheduleRefreshTimer()
        }

         ```

### One time Refresh 
   
   
  If a one time refreshal of logic is needed, the service has the method refreshToken() which can be employed.
    
  When KC is initialised using token, the token gets refreshed. So init itself refreshes. The below code will refresh
    
   ```js
      let tokenservice = new TokenService()
      tokenservice.init().then(function (token) {
        originalRequest.headers['Authorization'] = `Bearer ${token}`
        return axios(originalRequest)
      }).catch(error => {
        // cant refresh..Probably refresh token expired
        return Promise.reject(error)
      })
   ```
   
   
    
   ```tokenservice.refreshToken()``` will refresh the token as well
