# KeycloakService

This is an abstraction over they keycloak javascript adapter providing some methods to refresh the token.
The abstraction is provided so that COOPS-UI project or any other consumer of auth-web can stay independent of keycloak logic.

```js
KeyCloakService.initializeToken(<store?>, <isScheduleRefresh?>)
```

It has two optional arguments:

| Argument | Type | Description |
| --- | --- | --- | 
| **store** | vuex store | optional argument to pass the store of the app (default: null)
| **isScheduleRefresh** | boolean | optional argument to disable/enable scheduled refresh (default: true)



It supports two modes for **refreshing the token**


### Timer Mode
   
   In this case , it runs a timer [a plain old javascript settimeout] . It calculates the expiry of current keycloak token and schedules a timeout before 2 seconds of expiry
   Since the timers get destroyed on page refresh , execute the logic in start up or when user signs in
   
   A sample usage:
  
   1. Initialize [keycloak config](../Signin/README.md#keycloak-initialization)

   2. Register the component in vue

   3. Import keycloak service in the component:

      `import KeyCloakService from 'sbc-common-components/src/services/keycloak.services'`

   4. Start the timer
    
        ```js
        if (this.$store.getters['auth/isAuthenticated']) {
           await KeyCloakService.initializeToken(this.$store)
        }

         ```

### One time Refresh 
   
   
  If a one time refreshal of logic is needed, the service has the method refreshToken() which can be employed.
    
  When KC is initialised using token, the token gets refreshed. So init itself refreshes. The below code will refresh

  `import KeyCloakService from 'sbc-common-components/src/services/keycloak.services'`
    
  ```js
      KeyCloakService.initializeToken(this.$store, false).then(function (token) {
        originalRequest.headers['Authorization'] = `Bearer ${token}`
        return axios(originalRequest)
      }).catch(error => {
        // cant refresh..Probably refresh token expired
        return Promise.reject(error)
      })
  ```
  

  - `KeyCloakService.refreshToken()`: will refresh the token as well

---

### Get User Info

  ```KeyCloakService.getUserInfo()```

This function will get the user info from the logged in user's keycloak token

`import { KCUserProfile } from 'sbc-common-components/src/models/KCUserProfile'`

*KCUserProfile* can be used as the model for the *getUserInfo()* 

---
### Verify Roles

  ```KeyCloakService.verifyRoles(allowedRoles, disabledRoles)```

This function will verify whether the current logged in keycloak token has the allowed roles based on the role array passing via parameters

- eg: 
```js
KeyCloakService.verifyRoles(['admin', 'coordinator'], ['basic_user'])
```

here, the function will return true if the logged in KC token has roles `admin` or `cooordinator` and return false if it has `basic_user`