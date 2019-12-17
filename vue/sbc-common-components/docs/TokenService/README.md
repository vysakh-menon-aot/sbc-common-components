# TokenService

This is an abstraction over they keycloak javascript adapter providing some methods to refresh the token.
The abstraction is provided so that COOPS-UI project or any other consumer of auth-web can stay independent of keycloak logic.


It supports two modes for **refreshing the token**



### Timer Mode
   
   In this case , it runs a timer [a plain old javascript settimeout] . It calculates the expiry of current keycloak token and schedules a timeout before 2 seconds of expiry
   Since the timers get destroyed on page refresh , execute the logic in start up or when user signs in
   
   a sample usage
   
   1. Register the compoent in vue
        
        `Vue.prototype.$tokenServices = new TokenServices()`
   
   2. Init the tokenservice so that keycloak service is being set up
   3. start the timer
    
        ```if (sessionStorage.getItem('KEYCLOAK_TOKEN')) {
            // eslint-disable-next-line no-console
            console.info('[APP.vue] Token exists.So start the refreshtimer')
            var self = this
            this.$tokenServices.initUsingUrl(`/${process.env.VUE_APP_PATH}/config/kc/keycloak.json`).then(function (success) {
              self.$tokenServices.scheduleRefreshTimer()
            })

         ```

### One time Refresh 
   
   
   If a one time refreshal of logic is needed , the service has the method refreshToken() which can be employed.
    
  When KC is initialised using token , the token gets refreshed.So init itself refreshes. The below code will refresh
    
   ```
      let tokenservice = new TokenService()
            tokenservice.initUsingUrl(`/${process.env.VUE_APP_PATH}/config/kc/keycloak.json`).then(function (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`
              return axios(originalRequest)
            }).catch(error => {
              // cant refresh..Probably refresh token expired
              return Promise.reject(error)
            })
   ```
   
   
    
   ```tokenservice.refreshToken()``` will refresh the token as well
