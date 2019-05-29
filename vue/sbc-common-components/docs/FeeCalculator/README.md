# Fee Calculator

The component is a stand alone fee calculator widget which invokes the fee api and displays the output

As an input , it accepts the filingcode , entity type and an optional filinf description

### Prerequisites

 [How To Install the dependency](../install/README.md) 


 
## How to use the component

The component accepts a list of Objects which includes filingTypeCode , entityType ,filingDescription

**Sample FilingData object** 

```

  data () {
    return {

     filingData:
       {
        filingTypeCode: '', //mandatory
        entityType: '', //mandatory
        filingDescription :''
      }
    }


```

**Include it in the template**

```html 
<aside>
    <affix relative-element-selector="#example-content" :offset="{ top: 120, bottom: 40 }">
        <sbc-fee-summary v-bind:filingData="[...feeData]">
        </sbc-fee-summary>
    </affix>
</aside>

 ```

**How to trigger the change of widget on different filings**

``` vue
            fileAR: function () {
                 /*do your filing logic here */
 
                 this.feeData = {
                     filingTypeCode: 'OTANN',
                     entityType: 'CP',
                     filingDescription: ''
                 };
 
             },
             clearAllFiling: function () {
                 /*do your filing logic here */
                 this.feeData = [];
                 console.log("Change Prop1:" + JSON.stringify(this.feeData))
             },
             fileARandDirectorChangeAndAdress: function () {
                 /*do your filing logic here */
                 this.feeData = [{
                     filingTypeCode: 'OTANN',
                     entityType: 'CP',
                     filingDescription: 'COPS Annaul Fee'
                 },
                     {
                         filingTypeCode: 'OTADD',
                         entityType: 'CP',
                         filingDescription: 'Director Change Fee'
                     },
                     {
                         filingTypeCode: 'OTAOAD',
                         entityType: 'CP',
                         filingDescription: 'Address'
                     }
                 ]
             },
   ```
    
    
**token for invoking the API**

The component expects the JWT token in the session storage  as KEYCLOAK_TOKEN
