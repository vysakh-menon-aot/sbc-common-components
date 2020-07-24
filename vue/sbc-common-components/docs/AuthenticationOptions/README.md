# Authentication Options Component

Authentication options component.
can be used as a component in a page for showing multiple authentication options
### Prerequisites

 [How To Install the dependency](../install/README.md) 


 
## How to use the component

**import and include the component**

```
import SbcAuthenticationOptions from 'sbc-common-components/src/components/SbcAuthenticationOptions.vue'

@Component({
  components: {
    SbcAuthenticationOptions
  }
})

 ```
 
 **use it in the template**


```
<template>
  <div>
    <SbcAuthenticationOptions></SbcAuthenticationOptions>
  </div>
</template>
```

***If there is a redirect url once login is completed***


```
<template>
  <div>
    <SbcAuthenticationOptions
      :redirect-url="redirectUrlLink"
    ></SbcAuthenticationOptions>
  </div>
</template>
```


