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

import { mount } from '@vue/test-utils'

import BaseAddress from '@/components/BaseAddress.vue'

Vue.use(Vuetify)

// Boilerplate to prevent the complaint "[Vuetify] Unable to locate target [data-app]"
const app = document.createElement('div')
app.setAttribute('data-app', 'true')
document.body.append(app)

// The basic Canadian address used for testing the component.
const basicAddress = {
  street: '1234 Main St',
  deliveryInstructions: 'c/o The Management',
  city: 'Victoria',
  region: 'BC',
  postalCode: 'V8W 3J3',
  country: 'Canada'
}

test('No address', () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { isEditing: false }
  })

  // The "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([false])
})

test('Undefined address', () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: undefined, isEditing: false }
  })

  // The "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([false])
})

test('Null address', () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: null, isEditing: false }
  })

  // The "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([false])
})

test('Empty address', () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: '{}', isEditing: false }
  })

  // The "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([false])
})

test('Canadian address', () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(basicAddress), isEditing: false }
  })

  // The "valid" event should indicate the the address is valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([true])

  // Canada Post standard is that addresses within Canada do not include the country.
  expect(addressWrapper.html()).not.toContain((basicAddress.country))
})

test('Missing street', () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.street = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(modifiedAddress), isEditing: true }
  })

  // The "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([false])
})

test('Missing delivery instructions', () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.deliveryInstructions = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(modifiedAddress), isEditing: true }
  })

  // The "valid" event should indicate the the address is valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([true])
})

test('Missing city', () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.city = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(modifiedAddress), isEditing: true }
  })

  // The "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([false])
})

test('Missing region', () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.region = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(modifiedAddress), isEditing: true }
  })

  // The "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([false])
})

test('Missing postal code', () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.postalCode = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(modifiedAddress), isEditing: true }
  })

  // The "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([false])
})

test('Missing country', () => {
  let modifiedAddress = { ...basicAddress }
  modifiedAddress.country = ''

  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(modifiedAddress), isEditing: true }
  })

  // The "valid" event should indicate the the address is not valid.
  expect(addressWrapper.emitted().valid.length).toBe(1)
  expect(addressWrapper.emitted().valid[0]).toEqual([false])
})

test('Street modified', () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(basicAddress), isEditing: true }
  })

  // Coupled to internals of component, but unsure how else to do this.
  addressWrapper.vm.$data['address']['street'] = '13 Pig Sty Alley'

  // The "modified" event should indicate the the address has been modified.
  expect(addressWrapper.emitted().modified.length).toBe(1)
  expect(addressWrapper.emitted().modified[0]).toEqual([true])
})

test('Street modified/unmodified', () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(basicAddress), isEditing: true }
  })

  // Coupled to internals of component, but unsure how else to do this.
  addressWrapper.vm.$data['address']['street'] = '13 Pig Sty Alley'
  addressWrapper.vm.$data['address']['street'] = basicAddress.street

  // The "modified" event should indicate the the address has not been modified, then unmodified when changed back.
  expect(addressWrapper.emitted().modified.length).toBe(2)
  expect(addressWrapper.emitted().modified[0]).toEqual([true])
  expect(addressWrapper.emitted().modified[1]).toEqual([false])
})

test('Sync event', () => {
  const addressWrapper = mount(BaseAddress, {
    propsData: { addressJson: JSON.stringify(basicAddress), isEditing: true }
  })

  const newStreet = '13 Pig Sty Alley'

  // Coupled to internals of component, but unsure how else to do this.
  addressWrapper.vm.$data['address']['street'] = newStreet

  let modifiedAddress = { ...basicAddress }
  modifiedAddress.street = newStreet

  // The "update:addressJson" event should contain the new address, for syncing the change back to the parent.
  expect(addressWrapper.emitted()['update:addressJson'].length).toBe(1)
  expect(addressWrapper.emitted()['update:addressJson'][0]).toEqual([JSON.stringify(modifiedAddress)])
})
