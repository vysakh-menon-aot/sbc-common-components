# Signout Component

This component can be used in the signout page. 

### Prerequisites

[How To Install the dependency](../install/README.md) 

[How To Initialize Keycloak](../Signin/README.md#how-to-use-the-component) 


 
## How to use the component

before using this component, make sure you have set the keycloak config url. Steps for doing that are as follows:

### **import and include the component**

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
