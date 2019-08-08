# Layout
A simple layout component which gives standard header and standard footer. Placeholder SLOTs are used to pass in content to different parts of the layout.
 

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

 If a slot is not specified, the content will be passed to the default slot in `<main>`:
```
<template>
    <v-app class="app-container" id="app">
      <sbc-layout>
            <router-view/>
    </sbc-layout>
    </v-app>
</template>
```

To pass in content to a different part of the page, specify which slot the content should be passed to using `v-slot`. For example, to pass in content to the area of the page directly below the header:

```
<template>
    <v-app class="app-container" id="app">
      <sbc-layout>

        <template v-slot:app-body>
          // content to place below header
        <template>

        <router-view/>

    </sbc-layout>
    </v-app>
</template>
```
