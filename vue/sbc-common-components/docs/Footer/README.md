# Footer Component

Standard footer component.
Use Layout for most of the cases.
Use Footer alone when you need it alone.

### Prerequisites

 [How To Install the dependency](../install/README.md) 


 
## How to use the component

**import and include the component**

```
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'

export default {
  name: 'App.vue',
  components: {
    SbcFooter
  }
  
 ```
 
 **use it in the template**


```
<template>
  <v-app class="app-container" id="app">
    <SbcHeader></SbcHeader>
    <div class="app-body">
      <div class="app-body__inner">
        <div class="container">
          <main>
            <router-view/>
          </main>
        </div>
      </div>
    </div>
    <sbc-footer :aboutText="My App<hr>Version 1.0.0"></sbc-footer>
  </v-app>
</template>
```


