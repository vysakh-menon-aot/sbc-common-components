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

<template>
  <div class="meta-container__inner">
    <!-- Display fields -->
    <v-expand-transition>
      <div class="address-block"
          v-if="!editing"
      >
        <div class="address-block__info">
          <div class="address-block__info-row">
            {{ addressLocal.streetAddress }}
          </div>
          <div class="address-block__info-row pre-wrap"
            v-html="addressLocal.streetAddressAdditional">
          </div>
          <div class="address-block__info-row">
            <span>{{ addressLocal.addressCity }}</span>
            <span v-if="addressLocal.addressRegion !== '--'">&nbsp;{{ addressLocal.addressRegion }}</span>
            <span v-if="addressLocal.postalCode !== 'N/A'">&nbsp;&nbsp;{{ addressLocal.postalCode }}</span>
          </div>
          <div class="address-block__info-row">
            {{ getCountryName(addressCountry) }}
          </div>
          <div class="address-block__info-row"
               v-if="addressLocal.deliveryInstructions"
          >
            {{ addressLocal.deliveryInstructions }}
          </div>
        </div>
      </div>
    </v-expand-transition>

    <!-- Edit fields -->
    <v-expand-transition>
      <v-form lazy-validation
              name="address-form"
              ref="addressForm"
              v-if="editing"
      >
        <div class="form__row">
          <v-text-field autocomplete="address-complete"
                        filled
                        :label="streetAddressLabel"
                        name="street-address"
                        v-model="addressLocal.streetAddress"
                        :rules="rules.streetAddress"
                        @click="enableAddressComplete"
          />
        </div>
        <div class="form__row">
          <v-textarea auto-grow
                      filled
                      :label="streetAddressAdditionalLabel"
                      name="street-address-additional"
                      rows="1"
                      v-model="addressLocal.streetAddressAdditional"
                      :rules="rules.streetAddressAdditional"
          />
        </div>
        <div class="form__row three-column">
          <v-text-field filled
                        class="item"
                        :label="addressCityLabel"
                        name="address-city"
                        v-model="addressLocal.addressCity"
                        :rules="rules.addressCity"
          />
          <v-select v-if="useCountryRegions(addressCountry)"
                    filled
                    class="item"
                    :menu-props="{maxHeight:'40rem'}"
                    :label="addressRegionLabel"
                    name="address-region"
                    item-text="name"
                    item-value="short"
                    v-model="addressLocal.addressRegion"
                    :items="getCountryRegions(addressCountry)"
                    :rules="rules.addressRegion"
                    :readonly="isSchemaBC()"
          />
          <v-text-field v-else
                        filled
                        class="item"
                        :label="addressRegionLabel"
                        name="address-region"
                        v-model="addressLocal.addressRegion"
                        :rules="rules.addressRegion"
                        :readonly="isSchemaBC()"
          />
          <v-text-field filled
                        class="item"
                        :label="postalCodeLabel"
                        name="postal-code"
                        v-model="addressLocal.postalCode"
                        :rules="rules.postalCode"
          />
        </div>
        <div class="form__row">
          <v-select filled
                    :label="addressCountryLabel"
                    name="address-country"
                    menu-props="auto"
                    item-text="name"
                    item-value="code"
                    v-model="addressLocal.addressCountry"
                    :items="getCountries()"
                    :rules="rules.addressCountry"
                    :readonly="isSchemaCanada()"
          />
          <!-- special field to select PCA country, separate from our model field -->
          <input type="hidden" name="address-country-pca" :value="addressCountry" />
        </div>
        <div class="form__row">
          <v-textarea auto-grow
                      filled
                      :label="deliveryInstructionsLabel"
                      name="delivery-instructions"
                      rows="2"
                      v-model="addressLocal.deliveryInstructions"
                      :rules="rules.deliveryInstructions"
          />
        </div>
      </v-form>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">

import Vue from 'vue'
import { required } from 'vuelidate/lib/validators'
import { Component, Mixins, Emit, Prop, Watch } from 'vue-property-decorator'
import { Validation } from 'vue-plugin-helper-decorator'
import set from 'lodash.set'
import unset from 'lodash.unset'
import ValidationMixin from '../mixins/validation-mixin'
import CountriesProvincesMixin from '../mixins/countries-provinces-mixin'

/**
 * The component for displaying and editing an address.
 * Vuelidate is used to implement the validation rules (eg, what 'required' means and whether it's satisfied).
 * Vuetify is used to display any validation errors/styling.
 */
@Component({
  mixins: [ValidationMixin, CountriesProvincesMixin]
})
export default class BaseAddress extends Mixins(ValidationMixin, CountriesProvincesMixin) {
  /**
   * The validation object used by Vuelidate to compute address model validity.
   * @returns The Vuelidate validations object.
   */
  @Validation()
  public validations (): any {
    return { addressLocal: { ...this.schemaLocal } }
  }

  /**
   * Contains the address (if any) to be edited.
   */
  @Prop({ default: () => {} }) readonly address: object

  /**
   * Indicates whether the address should be shown in editing mode (true) or display mode (false).
   */
  @Prop({ default: false }) readonly editing: boolean

  /**
   * The address schema containing Vuelidate rules.
   */
  @Prop({ default: null }) readonly schema: any

  /**
   * A local (working) copy of the address, to contain the fields edited by the component (ie, the model).
   */
  private addressLocal: object = { ...this.address }

  /**
   * A copy of the address that the component was originally created with. This is used to determine whether or not
   * the address has been edited by the user.
   */
  private addressOriginal: object = { ...this.address }

  /**
   * A local (working) copy of the address schema.
   */
  // TODO: this misses the initial country setting (re: on edit)
  private schemaLocal: any = { ...this.schema }

  /**
   * Has this component been mounted yet? Initially unset, but will be set by the {@link mounted} lifecycle callback.
   */
  private isMounted: boolean = false

  /**
   * Getter for Address Country, to simplify template and so we can watch it below.
   */
  private get addressCountry (): string {
    return this.addressLocal['addressCountry']
  }

  /**
   * Getters for labels.
   * @returns The labels with 'optional' as needed.
   */
  private get streetAddressAdditionalLabel (): string {
    return 'Additional Street Address' + (this.isSchemaRequired('streetAddressAdditional') ? '' : ' (Optional)')
  }

  private get streetAddressLabel (): string {
    return 'Street Address' + (this.isSchemaRequired('streetAddress') ? '' : ' (Optional)')
  }

  private get addressCityLabel (): string {
    return 'City' + (this.isSchemaRequired('addressCity') ? '' : ' (Optional)')
  }

  private get addressRegionLabel (): string {
    let label: string
    let required = this.isSchemaRequired('addressRegion')

    // NB: make region required for Canada and USA
    if (this.addressLocal['addressCountry'] === 'CA') {
      label = 'Province'
      required = true
    } else if (this.addressLocal['addressCountry'] === 'US') {
      label = 'State'
      required = true
    } else {
      label = 'Province/State'
    }

    return label + (required ? '' : ' (Optional)')
  }

  private get postalCodeLabel (): string {
    let label: string
    if (this.addressLocal['addressCountry'] === 'US') {
      label = 'Zip Code'
    } else {
      label = 'Postal Code'
    }
    return label + (this.isSchemaRequired('postalCode') ? '' : ' (Optional)')
  }

  private get addressCountryLabel (): string {
    return 'Country' + (this.isSchemaRequired('addressCountry') ? '' : ' (Optional)')
  }

  private get deliveryInstructionsLabel (): string {
    return 'Delivery Instructions' + (this.isSchemaRequired('deliveryInstructions') ? '' : ' (Optional)')
  }

  /**
   * Helpers to check schema validations.
   * @returns Whether the subject schema validation is present.
   */
  private isSchemaRequired (prop: string): boolean {
    return Boolean(this.schemaLocal && this.schemaLocal[prop] && this.schemaLocal[prop].required)
  }

  private isSchemaCanada (prop: string = 'addressCountry'): boolean {
    return Boolean(this.schemaLocal && this.schemaLocal[prop] && this.schemaLocal[prop].isCanada)
  }

  private isSchemaBC (prop: string = 'addressRegion'): boolean {
    return Boolean(this.schemaLocal && this.schemaLocal[prop] && this.schemaLocal[prop].isBC)
  }

  /**
   * Getter for Vuetify rules object. Used to display any validation errors/styling.
   * @remark As a getter, this is initialized between created() and mounted().
   * @returns The Vuetify validation rules object.
   */
  private get rules (): { [attr: string]: Array<Function> } {
    return this.createVuetifyRulesObject('addressLocal')
  }

  /**
   * Lifecycle callback to convert the address JSON into an object, so that it can be used by the template.
   */
  private created (): void {
    // Let the parent know right away about the validity of the address.
    this.emitValid()
  }

  /**
   * Lifecycle callback to store the mounted state of the component. We don't want the address watcher firing events
   * while the component is being set up.
   */
  private mounted (): void {
    this.isMounted = true
  }

  /**
   * Emits an update message for the {@link address} property, so that the caller can ".sync" with it.
   */
  @Emit('update:address')
  private emitAddress (val: object): void { }

  /**
   * Emits the Vuelidate state of the address entered by the user.
   * @returns A boolean that is True if the address if valid, or False otherwise.
   */
  @Emit('valid')
  private emitValid (): boolean {
    return !this.$v.$invalid
  }

  /**
   * Emits True if the address is modified, or False otherwise.
   */
  @Emit('modified')
  private emitModified (val: boolean): void { }

  /**
   * Watches changes to the address object, so that if the parent changes the data, then the object copy of it that
   * backs the display will be updated.
   */
  @Watch('address', { deep: true })
  private onAddressChanged (): void {
    this.addressLocal = { ...this.address }
  }

  /**
   * Watches changes to the Address Country and updates the schema accordingly.
   */
  @Watch('addressCountry')
  private onAddressCountryChanged (): void {
    // skip this if component is called without a schema (eg, display mode)
    if (this.schema) {
      // NB: Vue does not detect property addition or deletion, so re-assign the local schema.
      // Ref: https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
      const addressRegion = { ...this.schema.addressRegion }
      // if we are using a region list for the current country then make region a required field
      if (this.useCountryRegions(this.addressLocal['addressCountry'])) {
        set(addressRegion, 'required', required)
      } else {
        unset(addressRegion, 'required')
      }
      this.schemaLocal = { ...this.schema, addressRegion }
    }
  }

  /**
   * Watches changes to the addressLocal object, to catch any changes to the fields within the address. Will notify the
   * parent object with the new address and whether or not the address is valid.
   */
  @Watch('addressLocal', { deep: true, immediate: true })
  private onAddressLocalChanged (): void {
    if (this.isMounted) {
      this.emitAddress(this.addressLocal)
      this.emitValid()

      const isModified = BaseAddress.stringify(this.addressOriginal) !== BaseAddress.stringify(this.addressLocal)
      this.emitModified(isModified)
    }
  }

  /**
   * Function to determine whether to use a country's known regions (ie, provinces/states).
   * @param code The short code of the country.
   * @returns Whether to use v-select or v-text-field for input.
   */
  private useCountryRegions (code: string): boolean {
    return (code === 'CA' || code === 'US')
  }

  /**
   * A convenience method for JSON.stringify that strips values that have empty strings.
   *
   * @param object the object to stringify.
   *
   * @returns A string that is the JSON representation of the object.
   */
  private static stringify (object: object): string {
    return JSON.stringify(object, (name: string, val: any) : any => { return val !== '' ? val : undefined })
  }

  /**
   * Enables AddressComplete for this instance of the address.
   */
  private enableAddressComplete (): void {
    // If you want to use this component with the Canada Post AddressComplete service, it needs the following:
    //  1. The AddressComplete JavaScript script include must be done to set up "window.pca".
    //  2. Your AddressComplete account key must be defined as "window.addressCompleteKey".
    const pca = window['pca']
    const key = window['addressCompleteKey']
    if (!pca || !key) {
      return
    }

    // Sets the id for the two form elements that are used by the AddressComplete code. If necessary this removes the
    // id from previous elements.
    this.moveElementId('street-address')
    this.moveElementId('address-country')

    // Destroy the old object if it exists, and create a new one.
    if (window['currentAddressComplete']) {
      window['currentAddressComplete'].destroy()
    }
    window['currentAddressComplete'] = this.createAddressComplete(pca, key)
  }

  /**
   * Sets the id attribute of the named element to the name. If there was a pre-existing element with the id already
   * set, it will be unset.
   *
   * @param name the name of the element for which to set the id.
   */
  private moveElementId (name: string): void {
    const oldElement = document.getElementById(name)
    const thisElement = this.$el.querySelector('[name="' + name + '"]')

    // If it's already set, don't do it again.
    if (oldElement !== thisElement) {
      if (oldElement) {
        oldElement.id = ''
      }

      thisElement.id = name
    }
  }

  /**
   * Creates the AddressComplete object for this instance of the component.
   *
   * @param pca the Postal Code Anywhere object provided by AddressComplete.
   * @param key the key for the Canada Post account that is to be charged for lookups.
   *
   * @return an object that is a pca.Address instance.
   */
  private createAddressComplete (pca, key: string): object {
    // Set up the two fields that AddressComplete will use for input.
    // Ref: https://www.canadapost.ca/pca/support/guides/advanced
    // Note: Use special field for country, which user can't click, and which AC will overwrite
    //       but that we don't care about.
    //       (Option `populate: false` doesn't seem to work.)
    const fields = [
      { element: 'street-address', mode: pca.fieldMode.SEARCH },
      { element: 'address-country-pca', mode: pca.fieldMode.COUNTRY }
    ]
    const options = { key }

    const addressComplete = new pca.Address(fields, options)

    // The documentation contains sample load/populate callback code that doesn't work, but this will. The side effect
    // is that it breaks the autofill functionality provided by the library, but we really don't want the library
    // altering the DOM because Vue is already doing so, and the two don't play well together.
    addressComplete.listen('populate', this.addressCompletePopulate)

    return addressComplete
  }

  /**
   * Callback to update the address data after the user chooses a suggested address.
   *
   * @param address the data object returned by the AddressComplete Retrieve API.
   */
  private addressCompletePopulate (address: object): void {
    this.addressLocal['streetAddress'] = address['Line1']
    // Combine extra address lines into Street Address Additional field.
    this.addressLocal['streetAddressAdditional'] = this.combineLines(
      this.combineLines(address['Line2'], address['Line3']),
      this.combineLines(address['Line4'], address['Line5'])
    )
    this.addressLocal['addressCity'] = address['City']
    if (this.useCountryRegions(address['CountryIso2'])) {
      // In this case, v-select will map known province code to province name
      // or v-select will be blank and user will have to select a known item.
      this.addressLocal['addressRegion'] = address['ProvinceCode']
    } else {
      // In this case, v-text-input will allow manual entry but province info is probably too long
      // so set region to null and add province name to the Street Address Additional field.
      // If length is excessive, user will have to fix it.
      this.addressLocal['addressRegion'] = null
      this.addressLocal['streetAddressAdditional'] = this.combineLines(
        this.addressLocal['streetAddressAdditional'], address['ProvinceName']
      )
    }
    this.addressLocal['postalCode'] = address['PostalCode']
    this.addressLocal['addressCountry'] = address['CountryIso2']

    // Validate the form, in case any fields are missing or incorrect.
    Vue.nextTick(() => { (this.$refs.addressForm as any).validate() })
  }

  private combineLines (line1: string, line2: string) {
    if (!line1) return line2
    if (!line2) return line1
    return line1 + '\n' + line2
  }
}

</script>

<style lang="scss" scoped>
  @import "../../src/assets/scss/theme.scss";

  .meta-container {
    display: flex;
    flex-flow: column nowrap;
    position: relative;
  }

  @media (min-width: 768px) {
    .meta-container {
      flex-flow: row nowrap;
    }
  }

  // Address Block Layout
  .address-block {
    display: flex;
  }

  .address-block__info {
    flex: 1 1 auto;
  }

  // Form Row Elements
  .form__row.three-column {
    align-items: stretch;
    display: flex;
    flex-flow: row nowrap;
    margin-left: -0.5rem;
    margin-right: -0.5rem;

    .item {
      flex: 1 1 auto;
      flex-basis: 0;
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }
  }

  .pre-wrap {
    white-space: pre-wrap;
  }
</style>
