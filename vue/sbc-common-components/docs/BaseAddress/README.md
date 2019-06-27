# Base Address

This is a stand alone address display / entry component.

The `BaseAddress` component has these properties:

- `address`: a JavaScript `object` that contains the existing address information. Can be undefined.
- `editing`: a `boolean` that is true if the component is to display the address in editing mode, or false if the
address is displayed as static text.

The `BaseAddress` component emits these events:

- `valid`: a `boolean` that is true if the address passes the validation tests, or false otherwise. This event will be
emitted when the component is first created, and every time the address is changed.
- `modified`: a `boolean` that is true if the address has been modified from its original value, or false otherwise.
In the case where the address is changed from its original value and then changed back to its original value, the final
event will be false.
- `update:address`: a JavaScript `object` containing the address. This will be emitted every time the address is
changed. The parent can use the `.sync` modifier to update its version of the `address` property.


### Prerequisites

[How To Install the dependency](../install/README.md) 

 
## How to use the component

**Sample Parent Class** 

```typescript
@Component({
  components: {
    'some-address': BaseAddress
  }
})
export default class ParentClass extends Vue {
  private address: object = { streetAddress: '1234 Main Street' }
  private isAddressEditing: boolean = false
  private isAddressModified: boolean = false
  private isAddressValid: boolean = false
  
  /// ...etc...
}
```

**Sample Template**

```html
  <...>
    <some-address :address.sync="address"
                  :is-editing="isAddressEditing"
                  @modified="isAddressModified"
                  @valid="isAddressValid"
    />
  </...>
```
