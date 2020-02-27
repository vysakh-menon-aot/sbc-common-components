# Signout Component

This component can be used in the signout page. 

### Prerequisites

[How To Install the dependency](../install/README.md) 


## How to use the component

before using this component, make sure you have set the keycloak config url and signout route. Steps for doing that are as follows:

### [**1. Initialize Keycloak**](../Signin/README.md#keycloak-initialization) 

### **2. Create Signout Route**
- Create a view component for signin (eg.: `SignoutView`)
- Define a 2 new routes in your routes array: `signout`, `signout-redirect`
- Refer the below snippet for the exact path urls expected by this component

```js
routes = [
    ...
    { path: '/signout', name: 'signout', component: SignoutView, props: true, meta: { requiresAuth: true } },
    { path: '/signout/:redirectUrl', name: 'signout-redirect', component: SignoutView, props: true, meta: { requiresAuth: true } },
    ...
  ]
```
---

### **import and include the component in the SignoutView (Signout page)**

```js
import SbcSignout from 'sbc-common-components/src/components/SbcSignout.vue'


@Component({
  methods: {
    ...
  },
  components: {
    SbcSignout
  }
})
```
 
### **use it in the template**

The component accepts **redirect-url** as input prop.

```html
<template>
  <sbc-signout :redirect-url="redirectUrl"></sbc-signout>
```

| Prop | Type | Description |
| --- | --- | --- | 
| **redirect-url** | string | url to redirect once the logout is completed from keycloak
