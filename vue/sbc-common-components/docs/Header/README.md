# Header Component

Standard header component.
Use Layout for most of the cases.Use Header alone when you need it alone
### Prerequisites

 [How To Install the dependency](../install/README.md) 


 
## How to use the component

**import and include the component**

```
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
   
   
   export default {
     name: 'App.vue',
     components: {
        SbcHeader
     },
 ```
 
 **use it in the template**


```
<template>
  <v-app class="app-container" id="app">
    <SbcHeader></SbcHeader>
```
