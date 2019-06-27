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

import { mount, Wrapper } from '@vue/test-utils'

import BaseAddress from '@/components/BaseAddress.vue'

Vue.use(Vuetify)

// Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
const app = document.createElement('div')
app.setAttribute('data-app', 'true')
document.body.append(app)

// The basic and valid Canadian address used for testing the component.
const basicAddress = {
  streetAddress: '1234 Main St',
  streetAddressAdditional: 'PO BOX STN PROV GOV',
  addressCity: 'Victoria',
  addressRegion: 'BC',
  postalCode: 'V8W 3J3',
  addressCountry: 'Canada',
  deliveryInstructions: 'c/o The Management'
}

// A different street to test address changes.
const differentStreet = '13 Pig Sty Alley'

// Input field selector to test changes to the DOM element.
const streetInputSelector = '[name="street-address"]'

// Convenience function for digging into the wrapper events and getting the last event for a given name.
function getLastEvent (wrapper: Wrapper<BaseAddress>, name: string): any {
  let eventsList = wrapper.emitted()[name]
  let events = eventsList[eventsList.length - 1]

  return events[events.length - 1]
}

test('No address', async () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { editing: false }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).not.toBeTruthy()
})

test('Undefined address', async () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { address: undefined, editing: false }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).not.toBeTruthy()
})

test('Null address', async () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { address: null, editing: false }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).not.toBeTruthy()
})

test('Empty address', async () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { address: {}, editing: false }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).not.toBeTruthy()
})

test('Address object isolation', async () => {
  let address: object = {}

  const addressWrapper = mount(BaseAddress, {
    propsData: { address: address, editing: false }
  })

  let inputElement = addressWrapper.find(streetInputSelector)
  inputElement.element['value'] = basicAddress.streetAddress
  inputElement.trigger('input')

  await Vue.nextTick()

  // The component should not be changing the property object.
  expect(address['streetAddress']).not.toEqual(basicAddress.streetAddress)
})

test('Canadian address - display', async () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { address: basicAddress, editing: false }
  })

  await Vue.nextTick()

  // We should be in display mode.
  expect(addressWrapper.find('.address-block').isVisible()).toBeTruthy()
  expect(addressWrapper.find('form[name="address-form"').isVisible()).not.toBeTruthy()

  // The last "valid" event should indicate the the address is valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).toBeTruthy()

  // Check that each of the fields appears in the display. Note that the Canada Post guideline says that addresses
  // within Canada do not include the country.
  expect(addressWrapper.find('.address-block').html()).toContain(basicAddress.streetAddress)
  expect(addressWrapper.find('.address-block').html()).toContain(basicAddress.streetAddressAdditional)
  expect(addressWrapper.find('.address-block').html()).toContain(basicAddress.addressCity)
  expect(addressWrapper.find('.address-block').html()).toContain(basicAddress.addressRegion)
  expect(addressWrapper.find('.address-block').html()).toContain(basicAddress.postalCode)
  expect(addressWrapper.find('.address-block').html()).not.toContain(basicAddress.addressCountry)
  expect(addressWrapper.find('.address-block').html()).toContain(basicAddress.deliveryInstructions)
})

test('Canadian address - edit', async () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { address: basicAddress, editing: true }
  })

  await Vue.nextTick()

  // We should be in edit mode.
  expect(addressWrapper.find('.address-block').isVisible()).not.toBeTruthy()
  expect(addressWrapper.find('[name="address-form"').isVisible()).toBeTruthy()

  // The last "valid" event should indicate the the address is valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).toBeTruthy()

  // Check that each of the inputs contains the value.
  expect(addressWrapper.find('[name="street-address"]').element['value']).toEqual(basicAddress.streetAddress)
  expect(addressWrapper.find('[name="street-address-additional"]').element['value']).toEqual(
    basicAddress.streetAddressAdditional)
  expect(addressWrapper.find('[name="address-city"]').element['value']).toEqual(basicAddress.addressCity)
  // TODO: Region
  expect(addressWrapper.find('[name="postal-code"]').element['value']).toEqual(basicAddress.postalCode)
  expect(addressWrapper.find('[name="address-country"]').element['value']).toEqual(basicAddress.addressCountry)
  expect(addressWrapper.find('[name="delivery-instructions"]').element['value']).toEqual(
    basicAddress.deliveryInstructions)
})

test('Missing street', async () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.streetAddress = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { address: modifiedAddress, editing: true }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).not.toBeTruthy()
})

test('Missing additional street', async () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.streetAddressAdditional = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { address: modifiedAddress, editing: true }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).toBeTruthy()
})

test('Missing delivery instructions', async () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.deliveryInstructions = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { address: modifiedAddress, editing: true }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).toBeTruthy()
})

test('Missing city', async () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.addressCity = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { address: modifiedAddress, editing: true }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).not.toBeTruthy()
})

test('Missing region', async () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.addressRegion = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { address: modifiedAddress, editing: true }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).not.toBeTruthy()
})

test('Missing postal code', async () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.postalCode = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { address: modifiedAddress, editing: true }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).not.toBeTruthy()
})

test('Missing country', async () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.addressCountry = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { address: modifiedAddress, editing: true }
  })

  await Vue.nextTick()

  // The last "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid).toBeDefined()
  expect(getLastEvent(addressWrapper, 'valid')).not.toBeTruthy()
})

test('Street modified', async () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { address: basicAddress, editing: true }
  })

  let inputElement = addressWrapper.find(streetInputSelector)
  inputElement.element['value'] = differentStreet
  inputElement.trigger('input')

  await Vue.nextTick()

  // The last "modified" event should indicate that the address has been modified.
  expect(addressWrapper.emitted().modified).toBeDefined()
  expect(getLastEvent(addressWrapper, 'modified')).toBeTruthy()
})

test('Street modified/unmodified', async () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { address: basicAddress, editing: true }
  })

  let inputElement = addressWrapper.find(streetInputSelector)
  inputElement.element['value'] = differentStreet
  inputElement.trigger('input')

  await Vue.nextTick()

  inputElement.element['value'] = basicAddress.streetAddress
  inputElement.trigger('input')

  await Vue.nextTick()

  // The last "modified" event should indicate that the address has not been modified.
  expect(addressWrapper.emitted().modified).toBeDefined()
  expect(getLastEvent(addressWrapper, 'modified')).not.toBeTruthy()
})

test('Sync event', async () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { address: basicAddress, editing: true }
  })

  let modifiedAddress = { ...basicAddress }
  modifiedAddress.streetAddress = differentStreet

  let inputElement = addressWrapper.find(streetInputSelector)
  inputElement.element['value'] = differentStreet
  inputElement.trigger('input')

  await Vue.nextTick()

  // The "update:address" event should contain the new address, for syncing the change back to the parent.
  expect(addressWrapper.emitted()['update:address']).toBeDefined()
  expect(getLastEvent(addressWrapper, 'update:address')).toMatchObject(modifiedAddress)
})
