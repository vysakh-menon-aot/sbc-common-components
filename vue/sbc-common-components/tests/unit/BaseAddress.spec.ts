//
// Copyright © 2019 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { mount, Wrapper } from '@vue/test-utils'
import { required, maxLength, minLength } from 'vuelidate/lib/validators'

import BaseAddress from '@/components/BaseAddress.vue'

Vue.use(Vuetify)
Vue.use(Vuelidate)
// suppress "avoid mutating a prop directly" warnings
// https://vue-test-utils.vuejs.org/api/config.html#silent
Vue.config.silent = true

let vuetify = new Vuetify({})

// Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
const app: HTMLDivElement = document.createElement('div')
app.setAttribute('data-app', 'true')
document.body.append(app)

// The basic and valid Canadian address used for testing the component.
const basicAddress = {
  streetAddress: '1234 Main St',
  streetAddressAdditional: 'PO BOX STN PROV GOV',
  addressCity: 'Victoria',
  addressRegion: 'BC', // NB: region code
  postalCode: 'V8W 3J3',
  addressCountry: 'CA', // NB: country code
  deliveryInstructions: 'c/o The Management'
}

// The basic address validation schema used for testing the component.
// Make only the base address fields required.
const basicSchema = {
  streetAddress: { required },
  streetAddressAdditional: { },
  addressCity: { required },
  addressCountry: { required },
  addressRegion: { required },
  postalCode: { required },
  deliveryInstructions: { }
}

// A different street to test address changes.
const differentStreet: string = '13 Pig Sty Alley'

// Input field selectors to test changes to the DOM elements.
const streetAddressSelector: string = '.street-address input'

/**
 * Returns the last event for a given name, to be used for testing event propagation in response to component changes.
 *
 * @param wrapper the wrapper for the component that is being tested.
 * @param name the name of the event that is to be returned.
 *
 * @return the value of the last named event for the wrapper.
 */
function getLastEvent (wrapper: Wrapper<BaseAddress>, name: string): any {
  const eventsList: Array<any> = wrapper.emitted(name)
  const events: Array<any> = eventsList[eventsList.length - 1]

  return events[0]
}

/**
 * Creates and mounts a component, so that it can be tested.
 *
 * @param address an object containing the address for the component. The default value is the {@link basicAddress}.
 * @param editing a boolean that indicates whether the component should be in edit (true) or display (false) mode.
 *     Default value is true.
 * @param schema an address validation schema for Vuelidate to use. The default value is the {@link basicSchema}.
 *
 * @return a wrapper for the BaseAddress component with the given props.
 */
function createComponent (
  address: object = { ...basicAddress },
  editing: boolean = true,
  schema: object = { ...basicSchema })
: Wrapper<BaseAddress> {
  return mount(BaseAddress, {
    sync: false,
    propsData: { address, editing, schema },
    vuetify
  })
}

describe('BaseAddress - base tests', () => {
  it('handles no props', () => {
    // Don't use createComponent -- do it manually so the props can be missing.
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, { vuetify })

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)
  })

  it('handles an undefined address', () => {
    // Don't use createComponent -- do it manually so some props can be undefined.
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      propsData: { address: undefined },
      vuetify
    })

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)
  })

  it('handles an undefined schema', () => {
    // Don't use createComponent -- do it manually so some props can be undefined.
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      propsData: { schema: undefined },
      vuetify
    })

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)
  })

  it('handles a null address', () => {
    const wrapper: Wrapper<BaseAddress> = createComponent(null)

    // The last "valid" event should indicate that the address is not valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)
  })

  it('handles a null schema', () => {
    const wrapper: Wrapper<BaseAddress> = createComponent(undefined, undefined, null)

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)
  })

  it('handles an empty address', () => {
    const wrapper: Wrapper<BaseAddress> = createComponent({})

    // The last "valid" event should indicate that the address is not valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)
  })

  it('handles an empty schema', () => {
    const wrapper: Wrapper<BaseAddress> = createComponent(undefined, undefined, {})

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)
  })

  it('supports address object isolation', () => {
    const address: object = {}
    const wrapper: Wrapper<BaseAddress> = createComponent(address)

    const inputElement: Wrapper<Vue> = wrapper.find(streetAddressSelector)
    inputElement.setValue(basicAddress.streetAddress)

    // The component should not be changing the property object.
    expect(address['streetAddress']).not.toEqual(basicAddress.streetAddress)
  })

  it('displays a Canadian address', () => {
    const wrapper: Wrapper<BaseAddress> = createComponent(undefined, false)

    // We should be in display mode.
    expect(wrapper.find('.address-block').exists()).toBe(true)
    expect(wrapper.find('[name="address-form"]').exists()).toBe(false)

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)

    // Check that each of the fields appears in the display.
    expect(wrapper.find('.address-block').text()).toContain(basicAddress.streetAddress)
    expect(wrapper.find('.address-block').text()).toContain(basicAddress.streetAddressAdditional)
    expect(wrapper.find('.address-block').text()).toContain(basicAddress.addressCity)
    expect(wrapper.find('.address-block').text()).toContain(basicAddress.addressRegion) // NB: region code
    expect(wrapper.find('.address-block').text()).toContain(basicAddress.postalCode)
    expect(wrapper.find('.address-block').text()).toContain('Canada') // NB: long name
    expect(wrapper.find('.address-block').text()).toContain(basicAddress.deliveryInstructions)
  })

  it('edits a Canadian address', () => {
    const wrapper: Wrapper<BaseAddress> = createComponent(undefined, true)

    // We should be in edit mode.
    expect(wrapper.find('.address-block').exists()).toBe(false)
    expect(wrapper.find('[name="address-form"]').exists()).toBe(true)

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)

    // Check that each of the inputs contains the value.
    expect(wrapper.find(streetAddressSelector).element['value']).toEqual(basicAddress.streetAddress)
    expect(wrapper.find('.street-address-additional textarea').element['value'])
      .toEqual(basicAddress.streetAddressAdditional)
    expect(wrapper.find('.address-city input').element['value']).toEqual(basicAddress.addressCity)
    // NB: for v-select, look at the div before the input
    expect(wrapper.find('.address-region .v-select__selection').text())
      .toEqual('British Columbia') // NB: long name
    expect(wrapper.find('.postal-code input').element['value']).toEqual(basicAddress.postalCode)
    // NB: for v-select, look at the div before the input
    expect(wrapper.find('.address-country .v-select__selection').text())
      .toEqual('Canada') // NB: long name
    expect(wrapper.find('.delivery-instructions textarea').element['value'])
      .toEqual(basicAddress.deliveryInstructions)
  })

  it('emits an update:address when the form changes', () => {
    const wrapper: Wrapper<BaseAddress> = createComponent()

    const modifiedAddress: object = { ...basicAddress, streetAddress: differentStreet }

    const inputElement: Wrapper<Vue> = wrapper.find(streetAddressSelector)
    inputElement.setValue(differentStreet)

    // The "update:address" event should contain the new address, for syncing the model back in the parent.
    expect(wrapper.emitted()['update:address']).toBeDefined()
    expect(getLastEvent(wrapper, 'update:address')).toMatchObject(modifiedAddress)
  })

  it('changes the form when the model changes', async () => {
    const addressToChange: object = { ...basicAddress }
    const wrapper: Wrapper<BaseAddress> = createComponent(addressToChange)

    addressToChange['streetAddress'] = differentStreet
    await wrapper.setProps({ address: { ...addressToChange } })

    const inputElement: Wrapper<Vue> = wrapper.find(streetAddressSelector)

    expect(inputElement.element['value']).toEqual(differentStreet)
  })
})

describe('BaseAddress - validation tests', () => {
  it('is valid with default props', () => {
    const wrapper: Wrapper<BaseAddress> = createComponent()

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)

    // Check that 'required' message is not displayed.
    expect(wrapper.find('[name="address-form"]').text()).not.toContain('This field is required')

    // Check that 'minimum length' message is not displayed.
    expect(wrapper.find('[name="address-form"]').text()).not.toContain('Minimum length is')

    // Check that 'maximum length' message is not displayed.
    expect(wrapper.find('[name="address-form"]').text()).not.toContain('Maximum length is')
  })

  it('is invalid with missing street', async () => {
    const wrapper: Wrapper<BaseAddress> = createComponent() // initially valid as above

    // Set a blank street address value.
    // NB: toggle streetAddress to resolve any conflict with other tests
    await wrapper.setData({ addressLocal: { streetAddress: null } })
    await wrapper.setData({ addressLocal: { streetAddress: '' } })

    // Validate the form so any error messages are displayed.
    const form = wrapper.vm.$refs.addressForm as any
    await form.validate()

    // The last "valid" event should indicate that the address is not valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'required' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('This field is required')
  })

  it('is valid with missing additional street', async () => {
    const wrapper: Wrapper<BaseAddress> = createComponent() // initially valid as above

    // Set a blank street address additional value.
    // NB: toggle streetAddressAdditional to resolve any conflict with other tests
    await wrapper.setData({ addressLocal: { streetAddressAdditional: null } })
    await wrapper.setData({ addressLocal: { streetAddressAdditional: '' } })

    // Validate the form so any error messages are displayed.
    const form = wrapper.vm.$refs.addressForm as any
    await form.validate()

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)

    // Check that 'optional' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('Additional Street Address (Optional)')

    // Check that 'required' message is not displayed.
    expect(wrapper.find('[name="address-form"]').text()).not.toContain('This field is required')
  })

  it('is invalid with missing city', async () => {
    const wrapper: Wrapper<BaseAddress> = createComponent() // initially valid as above

    // Set a blank address city value.
    // NB: toggle addressCity to resolve any conflict with other tests
    await wrapper.setData({ addressLocal: { addressCity: null } })
    await wrapper.setData({ addressLocal: { addressCity: '' } })

    // Validate the form so any error messages are displayed.
    const form = wrapper.vm.$refs.addressForm as any
    await form.validate()

    // The last "valid" event should indicate that the address is not valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'required' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('This field is required')
  })

  it('is invalid with missing region', async () => {
    // you can't "unselect" a v-select, so just create component without region
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      sync: false,
      propsData: {
        address: { addressRegion: null },
        editing: true,
        schema: {
          addressRegion: { required }
        }
      },
      vuetify
    })

    // Validate the form so any error messages are displayed.
    const form = wrapper.vm.$refs.addressForm as any
    await form.validate()

    // The last "valid" event should indicate that the address is not valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'required' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('This field is required')
  })

  it('is invalid with missing postal code', async () => {
    const wrapper: Wrapper<BaseAddress> = createComponent() // initially valid as above

    // Set a blank postal code value.
    // NB: toggle postalCode to resolve any conflict with other tests
    await wrapper.setData({ addressLocal: { postalCode: null } })
    await wrapper.setData({ addressLocal: { postalCode: '' } })

    // Validate the form so any error messages are displayed.
    const form = wrapper.vm.$refs.addressForm as any
    await form.validate()

    // The last "valid" event should indicate that the address is not valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'required' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('This field is required')
  })

  it('is invalid with missing country', async () => {
    // you can't "unselect" a v-select, so just create component without country
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      sync: false,
      propsData: {
        address: { addressCountry: null },
        editing: true,
        schema: {
          addressCountry: { required }
        }
      },
      vuetify
    })

    // Validate the form so any error messages are displayed.
    const form = wrapper.vm.$refs.addressForm as any
    await form.validate()

    // The last "valid" event should indicate that the address is not valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'required' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('This field is required')
  })

  it('is valid with missing delivery instructions', async () => {
    const wrapper: Wrapper<BaseAddress> = createComponent() // initially valid as above

    // Set a blank delivery instructions value.
    // NB: toggle deliveryInstructions to resolve any conflict with other tests
    await wrapper.setData({ addressLocal: { deliveryInstructions: null } })
    await wrapper.setData({ addressLocal: { deliveryInstructions: '' } })

    // Validate the form so any error messages are displayed.
    const form = wrapper.vm.$refs.addressForm as any
    await form.validate()

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)

    // Check that 'optional' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('Delivery Instructions (Optional)')

    // Check that 'required' message is not displayed.
    expect(wrapper.find('[name="address-form"]').text()).not.toContain('This field is required')
  })
})

describe('BaseAddress - validation rules', () => {
  it('handles "required" rule', async () => {
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      sync: false,
      propsData: {
        address: { addressCountry: '' },
        editing: true,
        schema: {
          addressCountry: { required }
        }
      },
      vuetify
    })

    // Validate the form for Vuetify to display errors.
    const form = wrapper.vm.$refs['addressForm'] as any
    await form.validate()

    // The last "valid" event should indicate that the address is invalid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'minimum length' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('This field is required')
  })

  it('handles "minLength" rule', async () => {
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      sync: false,
      propsData: {
        address: { addressCountry: 'Canada' },
        editing: true,
        schema: {
          addressCountry: { minLength: minLength(7) }
        }
      },
      vuetify
    })

    // Validate the form for Vuetify to display errors.
    const form = wrapper.vm.$refs['addressForm'] as any
    await form.validate()

    // The last "valid" event should indicate that the address is invalid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'minimum length' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('Minimum length is')
  })

  it('handles "maxLength" rule', async () => {
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      sync: false,
      propsData: {
        address: { addressCountry: 'Canada' },
        editing: true,
        schema: {
          addressCountry: { maxLength: maxLength(5) }
        }
      },
      vuetify
    })

    // Validate the form for Vuetify to display errors.
    const form = wrapper.vm.$refs['addressForm'] as any
    await form.validate()

    // The last "valid" event should indicate that the address is invalid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'maximum length' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('Maximum length is')
  })

  it('handles "isCanada" rule', async () => {
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      sync: false,
      propsData: {
        address: { addressCountry: 'US' },
        editing: true,
        schema: {
          addressCountry: { isCanada: (val) => Boolean(val === 'CA') }
        }
      },
      vuetify
    })

    // Validate the form for Vuetify to display errors.
    const form = wrapper.vm.$refs['addressForm'] as any
    await form.validate()

    // The last "valid" event should indicate that the address is invalid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'must be Canada' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('Address must be in Canada')

    // Check that country input control is readonly.
    expect(wrapper.find('.address-country input').attributes('readonly')).toBe('readonly')
  })

  it('handles "isBC" rule', async () => {
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      sync: false,
      propsData: {
        address: { addressCountry: 'CA', addressRegion: 'AB' },
        editing: true,
        schema: {
          addressRegion: { isBC: (val) => Boolean(val === 'BC') }
        }
      },
      vuetify
    })

    // Validate the form for Vuetify to display errors.
    const form = wrapper.vm.$refs['addressForm'] as any
    await form.validate()

    // The last "valid" event should indicate that the address is invalid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'must be Canada' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('Address must be in BC')

    // Check that region input control is readonly.
    expect(wrapper.find('.address-region input').attributes('readonly')).toBe('readonly')
  })
})

describe('BaseAddress - conditional validation', () => {
  it('sets region as required when country is Canada', async () => {
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      sync: false,
      propsData: {
        address: {
          addressRegion: null,
          addressCountry: 'ZZ'
        },
        editing: true,
        schema: {
          addressRegion: { } // need non-empty schema
        }
      },
      vuetify
    })

    // Set country to Canada to set 'required' validation.
    await wrapper.setData({ addressLocal: { addressCountry: 'CA' } })

    // Validate the form for Vuetify to display errors.
    const form = wrapper.vm.$refs['addressForm'] as any
    await form.validate()

    // The last "valid" event should indicate that the address is not valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(false)

    // Check that 'required' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('This field is required')
  })

  it('sets region as optional when country is not Canada', async () => {
    const wrapper: Wrapper<BaseAddress> = mount(BaseAddress, {
      sync: false,
      propsData: {
        address: {
          addressRegion: null,
          addressCountry: 'CA'
        },
        editing: true,
        schema: {
          addressRegion: { } // need non-empty schema
        }
      },
      vuetify
    })

    // Set country to "not Canada" to unset 'required' validation.
    await wrapper.setData({ addressLocal: { addressCountry: 'ZZ' } })

    // Validate the form for Vuetify to display errors.
    const form = wrapper.vm.$refs['addressForm'] as any
    await form.validate()

    // The last "valid" event should indicate that the address is valid.
    expect(wrapper.emitted().valid).toBeDefined()
    expect(getLastEvent(wrapper, 'valid')).toBe(true)

    // Check that 'optional' message is displayed.
    expect(wrapper.find('[name="address-form"]').text()).toContain('Province/State (Optional)')

    // Check that 'required' message is not displayed.
    expect(wrapper.find('[name="address-form"]').text()).not.toContain('This field is required')
  })
})
