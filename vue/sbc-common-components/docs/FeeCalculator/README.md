# Fee Calculator

The component is a stand alone fee calculator widget which invokes the fee api and displays the output

As an input , it accepts the filingcode , entity type and an optional filing description

### Prerequisites

 [How To Install the dependency](../install/README.md) 


 
## How to use the component

The component accepts a list of Objects which includes filingTypeCode , entityType ,filingDescription

**Sample FilingData object** 

```js

  data () {
    return {

     filingData:
       {
        filingTypeCode: '', //mandatory
        entityType: '', //mandatory
        filingDescription :'',
        waiveFees: false,
        priority: false, 
        futureEffective: false,
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

```js
            fileAR: function () {
                 /*do your filing logic here */
 
                 this.feeData = {
                     filingTypeCode: 'OTANN',
                     entityType: 'CP',
                     filingDescription: '',
                     waiveFees: false,
                     priority: false, 
                     futureEffective: false,
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
                    filingDescription: 'COPS Annual Fee',
                    waiveFees: false,
                    priority: false, 
                    futureEffective: false,
                },
                {
                    filingTypeCode: 'OTADD',
                    entityType: 'CP',
                    filingDescription: 'Director Change Fee',
                    waiveFees: false,
                    priority: true, 
                    futureEffective: false,
                },
                {
                    filingTypeCode: 'OTAOAD',
                    entityType: 'CP',
                    filingDescription: 'Address',
                    waiveFees: false,
                    priority: false, 
                    futureEffective: true,
                }]
             },
   ```
    
    
**token for invoking the API**

The component expects the JWT token in the session storage  as KEYCLOAK_TOKEN
