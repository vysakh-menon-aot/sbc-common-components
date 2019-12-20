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
  <div class="base-address">
    <!-- Display fields -->
    <v-expand-transition>
      <div v-if="!editing" class="address-block">
        <div class="address-block__info pre-wrap">
          <div class="address-block__info-row">{{ addressLocal.streetAddress }}</div>
          <div class="address-block__info-row">{{ addressLocal.streetAddressAdditional }}</div>
          <div class="address-block__info-row">
            <span>{{ addressLocal.addressCity }}</span>
            <span v-if="addressLocal.addressRegion">&nbsp;{{ addressLocal.addressRegion }}</span>
            <span v-if="addressLocal.postalCode">&nbsp;{{ addressLocal.postalCode }}</span>
          </div>
          <div class="address-block__info-row">{{ getCountryName(addressCountry) }}</div>
          <div class="address-block__info-row">{{ addressLocal.deliveryInstructions }}</div>
        </div>
      </div>
    </v-expand-transition>

    <!-- Edit fields -->
    <v-expand-transition>
      <v-form v-if="editing" ref="addressForm" name="address-form" lazy-validation>
        <div class="form__row">
          <!-- NB: "name" attribute is needed for moveElementId() -->
          <v-text-field autocomplete="address-complete"
                        filled
                        class="street-address"
                        name="street-address"
                        :label="streetAddressLabel"
                        v-model="addressLocal.streetAddress"
                        :rules="[...rules.streetAddress, ...spaceRules]"
                        @click="enableAddressComplete"
          />
        </div>
        <div class="form__row">
          <v-textarea auto-grow
                      filled
                      class="street-address-additional"
                      :label="streetAddressAdditionalLabel"
                      rows="1"
                      v-model="addressLocal.streetAddressAdditional"
                      :rules="[...rules.streetAddressAdditional, ...spaceRules]"
          />
        </div>
        <div class="form__row three-column">
          <v-text-field filled
                        class="item address-city"
                        :label="addressCityLabel"
                        v-model="addressLocal.addressCity"
                        :rules="[...rules.addressCity, ...spaceRules]"
          />
          <v-select v-if="useCountryRegions(addressCountry)"
                    filled
                    class="item address-region"
                    :menu-props="{maxHeight:'40rem'}"
                    :label="addressRegionLabel"
                    item-text="name"
                    item-value="short"
                    v-model="addressLocal.addressRegion"
                    :items="getCountryRegions(addressCountry)"
                    :rules="[...rules.addressRegion, ...spaceRules]"
                    :readonly="isSchemaBC()"
          />
          <v-text-field v-else
                        filled
                        class="item address-region"
                        :label="addressRegionLabel"
                        v-model="addressLocal.addressRegion"
                        :rules="[...rules.addressRegion, ...spaceRules]"
                        :readonly="isSchemaBC()"
          />
          <v-text-field filled
                        class="item postal-code"
                        :label="postalCodeLabel"
                        v-model="addressLocal.postalCode"
                        :rules="[...rules.postalCode, ...spaceRules]"
          />
        </div>
        <div class="form__row">
          <v-select filled
                    class="address-country"
                    :label="addressCountryLabel"
                    menu-props="auto"
                    item-text="name"
                    item-value="code"
                    v-model="addressLocal.addressCountry"
                    :items="getCountries()"
                    :rules="[...rules.addressCountry, ...spaceRules]"
                    :readonly="isSchemaCanada()"
          />
          <!-- special field to select PCA country, separate from our model field -->
          <!-- NB: "name" attribute is needed for moveElementId() -->
          <input type="hidden" name="address-country-pca" :value="addressCountry" />
        </div>
        <div class="form__row">
          <v-textarea auto-grow
                      filled
                      class="delivery-instructions"
                      :label="deliveryInstructionsLabel"
                      rows="2"
                      v-model="addressLocal.deliveryInstructions"
                      :rules="[...rules.deliveryInstructions, ...spaceRules]"
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
   * Default is "empty address" in case parent doesn't provide it (eg, for new address).
   */
  @Prop({
    default: () => ({
      streetAddress: '',
      streetAddressAdditional: '',
      addressCity: '',
      addressRegion: '',
      postalCode: '',
      addressCountry: '',
      deliveryInstructions: ''
    })
  })
  readonly address: object

  /**
   * Indicates whether the address should be shown in editing mode (true) or display mode (false).
   */
  @Prop({ default: false })
  readonly editing: boolean

  /**
   * The address schema containing Vuelidate rules.
   */
  @Prop({ default: null })
  readonly schema: any

  /**
   * A local (working) copy of the address, to contain the fields edited by the component (ie, the model).
   */
  private addressLocal: object = { }

  /**
   * A local (working) copy of the address schema.
   */
  // TODO: this misses the initial country setting (re: on edit)
  private schemaLocal: any = { ...this.schema }

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
   * Array of validation rules used by input elements to prevent extra whitespace.
   */
  private readonly spaceRules: Array<Function> = [
    v => !/^\s/g.test(v) || 'Invalid spaces', // leading spaces
    v => !/\s$/g.test(v) || 'Invalid spaces', // trailing spaces
    v => !/\s\s/g.test(v) || 'Invalid word spacing' // multiple inline spaces
  ]

  /**
   * Getter for Vuetify rules object. Used to display any validation errors/styling.
   * @remark As a getter, this is initialized between created() and mounted().
   * @returns The Vuetify validation rules object.
   */
  private get rules (): { [attr: string]: Array<Function> } {
    return this.createVuetifyRulesObject('addressLocal')
  }

  /**
   * Emits an update message for the {@link address} property, so that the caller can ".sync" with it.
   */
  @Emit('update:address')
  private emitAddress (val: object): void { }

  /**
   * Emits the Vuelidate state of the address entered by the user.
   */
  @Emit('valid')
  private emitValid (val: boolean): void { }

  /**
   * Watches changes to the Address object, so that if the parent changes the data, then
   * the working copy of it is updated.
   */
  @Watch('address', { deep: true, immediate: true })
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
      if (this.useCountryRegions(this.addressLocal['addressCountry'])) {
        // we are using a region list for the current country so make region a required field
        const addressRegion = { ...this.schema.addressRegion, required }
        // re-assign the local schema because Vue does not detect property addition
        this.schemaLocal = { ...this.schema, addressRegion }
      } else {
        // we are not using a region list for the current country so remove required property
        const { required, ...addressRegion } = this.schema.addressRegion
        // re-assign the local schema because Vue does not detect property deletion
        this.schemaLocal = { ...this.schema, addressRegion }
      }
    }
  }

  /**
   * Watches changes to the Address Local object, to catch any changes to the fields within the address.
   * Will notify the parent object with the new address and whether or not the address is valid.
   */
  @Watch('addressLocal', { deep: true, immediate: true })
  private onAddressLocalChanged (): void {
    this.emitAddress(this.addressLocal)
    this.emitValid(!this.$v.$invalid)
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
    this.moveElementId('address-country-pca')

    // Destroy the old object if it exists, and create a new one.
    if (window['currentAddressComplete']) {
      window['currentAddressComplete'].destroy()
    }
    window['currentAddressComplete'] = this.createAddressComplete(pca, key)
  }

  /**
   * Sets the id attribute of the _named_ element to its name. If there was a pre-existing element with the id already
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
    const newAddressLocal: object = {}

    newAddressLocal['streetAddress'] = address['Line1']
    // Combine extra address lines into Street Address Additional field.
    newAddressLocal['streetAddressAdditional'] = this.combineLines(
      this.combineLines(address['Line2'], address['Line3']),
      this.combineLines(address['Line4'], address['Line5'])
    )
    newAddressLocal['addressCity'] = address['City']
    if (this.useCountryRegions(address['CountryIso2'])) {
      // In this case, v-select will map known province code to province name
      // or v-select will be blank and user will have to select a known item.
      newAddressLocal['addressRegion'] = address['ProvinceCode']
    } else {
      // In this case, v-text-input will allow manual entry but province info is probably too long
      // so set region to null and add province name to the Street Address Additional field.
      // If length is excessive, user will have to fix it.
      newAddressLocal['addressRegion'] = null
      newAddressLocal['streetAddressAdditional'] = this.combineLines(
        newAddressLocal['streetAddressAdditional'], address['ProvinceName']
      )
    }
    newAddressLocal['postalCode'] = address['PostalCode']
    newAddressLocal['addressCountry'] = address['CountryIso2']

    // re-assign the local address to force Vuetify update
    this.addressLocal = newAddressLocal

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
@import "../assets/scss/theme.scss";

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

// make 'readonly' inputs looks disabled
// (can't use 'disabled' because we want normal error styling)
.v-select.v-input--is-readonly,
.v-text-field.v-input--is-readonly {
  pointer-events: none;

  ::v-deep .v-label {
    // set label colour to same as disabled
    color: rgba(0,0,0,.38);
  }

  ::v-deep .v-select__selection {
    // set selection colour to same as disabled
    color: rgba(0,0,0,.38);
  }

  ::v-deep .v-icon {
    // set error icon colour to same as disabled
    color: rgba(0,0,0,.38) !important;
    opacity: 0.6;
  }
}
</style>
