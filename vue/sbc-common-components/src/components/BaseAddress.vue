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
           v-show="!editing"
      >
        <div class="address-block__info">
          <div class="address-block__info-row">
            {{ addressLocal.streetAddress }}
          </div>
          <div class="address-block__info-row">
            {{ addressLocal.streetAddressAdditional }}
          </div>
          <div class="address-block__info-row">
            <span>{{ addressLocal.addressCity }}</span>
            <span>&nbsp;{{ addressLocal.addressRegion }}</span>
            <span>&nbsp;&nbsp;{{ addressLocal.postalCode }}</span>
          </div>
          <div class="address-block__info-row"
               v-if="addressLocal.addressCountry !== 'Canada'"
          >
            {{ addressLocal.addressCountry }}
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
              v-show="editing"
      >
        <div class="form__row">
          <v-text-field box
                        label="Street Address"
                        name="street-address"
                        v-model="addressLocal.streetAddress"
                        :rules="streetRules"
          ></v-text-field>
        </div>
        <div class="form__row">
          <v-text-field box
                        label="Additional Street Address (Optional)"
                        name="street-address-additional"
                        v-model="addressLocal.streetAddressAdditional"
          ></v-text-field>
        </div>
        <div class="form__row three-column">
          <v-text-field box
                        class="item"
                        label="City"
                        name="address-city"
                        required
                        v-model="addressLocal.addressCity"
                        :rules="cityRules"
          ></v-text-field>
          <v-select box
                    class="item"
                    label="Province"
                    name="address-region"
                    v-model="addressLocal.addressRegion"
                    :items="regions"
          ></v-select>
          <v-text-field box
                        class="item"
                        label="Postal Code"
                        name="postal-code"
                        required
                        v-model="addressLocal.postalCode"
                        :rules="regionRules"
          ></v-text-field>
        </div>
        <div class="form__row">
          <v-text-field box
                        label="Country"
                        name="address-country"
                        required
                        v-model="addressLocal.addressCountry"
                        :rules="countryRules"
          ></v-text-field>
        </div>
        <div class="form__row">
          <v-textarea auto-grow
                      box
                      label="Delivery Instructions (Optional)"
                      name="delivery-instructions"
                      rows="2"
                      v-model="addressLocal.deliveryInstructions"
          />
        </div>
      </v-form>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">

import Vue from 'vue'
import { Component, Emit, Prop, Watch } from 'vue-property-decorator'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

/**
 * The component for displaying and editing addresses.
 */
@Component({
  mixins: [validationMixin],
  validations: {
    address: {
      streetAddress: {
        required
      },
      addressCity: {
        required
      },
      addressRegion: {
        required
      },
      postalCode: {
        required
      },
      addressCountry: {
        required
      }
    }
  }
})
export default class BaseAddress extends Vue {
  /**
   * Contains the address (if any) to be edited.
   */
  @Prop({ default: () => {} }) readonly address: object

  /**
   * Indicates whether the address should be shown in editing mode (true) display mode (false).
   */
  @Prop({ default: false }) readonly editing: boolean

  /**
   * A local copy of the address object, to contain the fields edited by the component.
   */
  private addressLocal: object = { ...this.address }

  /**
   * A copy of the address that the component was originally created with. This is used to determine whether or not the
   * address has been edited by the user.
   */
  private addressOriginal: object = { ...this.address }

  /**
   * Has this component been mounted yet? Initially unset, but will be set by the {@link mounted} lifecycle callback.
   */
  private isMounted: boolean

  /**
   * The provinces for the address drop-down list.
   */
  private regions: string[] = [
    'BC', 'AB', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
  ]

  // TODO: Convert from Vuetify validation to Vuelidate using JSON Schema - temporarily using Vuetify for display.
  private streetRules = [ v => !!v || 'A street address is required' ]
  private cityRules = [ v => !!v || 'A city is required' ]
  private regionRules = [ v => !!v || 'A province/state is required' ]
  private postalCodeRules = [ v => !!v || 'A postal code is required' ]
  private countryRules = [ v => !!v || 'A country is required' ]

  /**
   * Lifecycle callback to convert the address JSON into an object, so that it can be used by the template.
   */
  private created () : void {
    // Let the parent know right away about the validity of the address.
    this.emitValid()
  }

  /**
   * Lifecycle callback to store the mounted state of the component. We don't want the address watcher firing events
   * while the component is being set up.
   */
  private mounted () : void {
    this.isMounted = true
  }

  /**
   * Emits an update message for the {@link address} property, so that the caller can ".sync" with it.
   *
   * @returns the {@link addressLocal} object.
   */
  @Emit('update:address')
  private emitAddress () : object {
    return this.addressLocal
  }

  /**
   * Emits the validity state of the address entered by the user.
   *
   * @returns a boolean that is true if the address if valid, false otherwise.
   */
  @Emit('valid')
  private emitValid () : boolean {
    return !this.$v.$invalid
  }

  /**
   * Emits the modified state of the address.
   *
   * @returns a boolean that is true if the address has been modified, false otherwise.
   */
  @Emit('modified')
  private emitModified () : boolean {
    return JSON.stringify(this.addressOriginal) !== JSON.stringify(this.addressLocal)
  }

  /**
   * Watches changes to the address object, so that if the parent changes the data then the object copy of it that
   * backs the display will be updated.
   */
  @Watch('address', { deep: true })
  private onAddressChanged () : void {
    this.addressLocal = { ...this.address }
  }

  /**
   * Watches changes to the addressLocal object, to catch any changes to the fields within the address. Will notify the
   * parent object with the new address and whether or not the address is valid.
   */
  @Watch('addressLocal', { deep: true, immediate: true })
  private onAddressLocalChanged () : void {
    if (this.isMounted) {
      this.emitAddress()
      this.emitValid()
      this.emitModified()
    }
  }
}

</script>

<style scoped lang="stylus">

  @import "../../src/assets/styl/theme.styl"

  .meta-container
    display flex
    flex-flow column nowrap
    position relative

  .validationError
    border-color red
    border-radius .3rem
    border-style groove
    border-width thin

  .validationErrorInfo
    color red

  @media (min-width 768px)
    .meta-container
      flex-flow row nowrap

  // Address Block Layout
  .address-block
    display flex

  .address-block__info
    flex 1 1 auto

  // Form Row Elements
  .form__row.three-column
    align-items stretch
    display flex
    flex-flow row nowrap
    margin-left -0.5rem
    margin-right -0.5rem

    .item
      flex 1 1 auto
      flex-basis 0
      margin-left 0.5rem
      margin-right 0.5rem

</style>
