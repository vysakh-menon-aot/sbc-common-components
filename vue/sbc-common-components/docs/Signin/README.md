# Signin Component

This component can be used in the signin page. 

### Prerequisites

 [How To Install the dependency](../install/README.md) 


 
## How to use the component

before using this component, make sure you have set the keycloak config url. Steps for doing that are as follows:

### ***Keycloak Initialization***

import in the **App.vue** file

```js
import KeyCloakService from 'sbc-common-components/src/services/keycloak.services'
```

in the mount function of App class:

```js
  private async mounted (): Promise<void> {
    // set keycloak config file's location to the sbc-common-components
    await KeyCloakService.setKeycloakConfigUrl(`${process.env.VUE_APP_PATH}config/kc/keycloak.json`)
```

### **import and include the component**

```js
import SbcSignin from 'sbc-common-components/src/components/SbcSignin.vue'


@Component({
  methods: {
    ...
  },
  components: {
    SbcSignin
  }
})
```
 
### **use it in the template**

The component accepts ***idp-hint*** and ***redirect-url-login-fail*** as input props, and outputs two events: ***keycloak-session-ready*** and ***sync-user-profile-ready***

```html
<template>
  <sbc-signin
    :idp-hint="idpHint"
    :redirect-url-login-fail="redirectUrlLoginFail"
    @keycloak-session-ready="updateHeader()"
    @sync-user-profile-ready="syncUserProfile()"
  ></sbc-signin>
```

| Prop | Type | Description |
| --- | --- | --- | 
| **idp-hint** | string | name/keyword of the identity provider you are using. (default: bcsc)
| **redirect-url-login-fail** | string | optional url to redirect if the keycloak login failed (default: '')
| **keycloak-session-ready** | event | this event will get emitted when the keycloak is authenticated and synced keycloak session values, you can update the header or load the userprofiles once this event is emitted.
| **sync-user-profile-ready** | event | this event will get emitted if the idpHint is 'bcsc' and keycloak initializations is complete. You can sync your user profile from application services.
