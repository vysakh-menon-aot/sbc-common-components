# Layout
A simple layout component which gives standard header and standard footer. A place holder SLOT is there to include the body
 

### Prerequisites

 [How To Install the dependency](../install/README.md) 


## How to use the component

**import and include the component**

```import SbcLayout from 'sbc-common-components/src/components/SbcLayout.vue'  
 export default Vue.extend({  
   name: 'app',
   components: {
     SbcLayout
   }
 })
 </script>
 ```
 
 **use it in the template**


```
<template>
    <v-app class="app-container" id="app">
      <sbc-layout>
            <router-view/>
    </sbc-layout>
    </v-app>
</template>
```
