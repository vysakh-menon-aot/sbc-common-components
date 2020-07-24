# Signin Component

This component can be used in the signin page. 

### Prerequisites

 [How To Install the dependency](../install/README.md) 



## How to use the component

before using this component, make sure you have set the keycloak config url and signin route. Steps for doing that are as follows:

### **1. Keycloak Initialization**

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
---

### **2. Create Signin Route**
- Create a view component for signin (eg.: `SigninView`)
- Define a 3 new routes in your routes array: `signin`, `signin-redirect`, `signin-redirect-fail`
- Refer the below snippet for the exact path urls expected by this component

```js
routes = [
    ...
    { path: '/signin/:idpHint', name: 'signin', component: SigninView, props: true, meta: { requiresAuth: false } },
    { path: '/signin/:idpHint/:redirectUrl', name: 'signin-redirect', component: SigninView, props: true, meta: { requiresAuth: false } },
    { path: '/signin/:idpHint/:redirectUrl/:redirectUrlLoginFail', name: 'signin-redirect-fail', component: SigninView, props: true, meta: { requiresAuth: false } },
    ...
  ]
```
---

### **import and include the component in the SigninView (Signin page)**

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

The component accepts **idp-hint** and **redirect-url-login-fail** as input props, and output an event **sync-user-profile-ready** which emits once the signin process is completed.

```html
<template>
  <sbc-signin
    :idp-hint="idpHint"
    :redirect-url-login-fail="redirectUrlLoginFail"
    @sync-user-profile-ready="authenticationComplete"
  ></sbc-signin>
```

| Prop | Type | Description |
| --- | --- | --- | 
| **idp-hint** | string | name/keyword of the identity provider you are using. (default: bcsc)
| **redirect-url-login-fail** | string | optional url to redirect if the keycloak login failed (default: '')
| **sync-user-profile-ready** | event | this event will get emitted once the login process in the keycloak is completed. You can sync your user profile from application services.
