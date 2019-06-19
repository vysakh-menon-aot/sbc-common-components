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
           v-show="!isEditing"
      >
        <div class="address-block__info">
          <div class="address-block__info-row">
            {{ address.street }}
          </div>
          <div class="address-block__info-row"
               v-if="address.deliveryInstructions"
          >
            {{ address.deliveryInstructions }}
          </div>
          <div class="address-block__info-row">
            <span>{{ address.city }}</span>
            <span>&nbsp;{{ address.region }}</span>
            <span>&nbsp;&nbsp;{{ address.postalCode }}</span>
          </div>
          <div class="address-block__info-row"
               v-if="address.country !== 'Canada'"
          >
            {{ address.country }}
          </div>
        </div>
      </div>
    </v-expand-transition>

    <!-- Edit fields -->
    <v-expand-transition>
      <v-form lazy-validation
              ref="deliveryAddressForm"
              v-show="isEditing"
      >
        <div class="form__row">
          <v-text-field box
                        id="street-address"
                        label="Street Address"
                        v-model="address.street"
                        :rules="streetRules"
          ></v-text-field>
        </div>
        <div class="form__row">
          <v-textarea auto-grow
                      box
                      label="Delivery Instructions (Optional)"
                      rows="2"
                      v-model="address.deliveryInstructions"
          />
        </div>
        <div class="form__row three-column">
          <v-text-field box
                        class="item"
                        id="city"
                        label="City"
                        required
                        v-model="address.city"
                        :rules="cityRules"
          ></v-text-field>
          <v-select box
                    class="item"
                    id="region"
                    label="Province"
                    v-model="address.region"
                    :items="regions"
          ></v-select>
          <v-text-field box
                        class="item"
                        id="postal-code"
                        label="Postal Code"
                        required
                        v-model="address.postalCode"
                        :rules="regionRules"
          ></v-text-field>
        </div>
        <div class="form__row">
          <v-text-field box
                        id="country"
                        label="Country"
                        required
                        v-model="address.country"
                        :rules="countryRules"
          ></v-text-field>
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
      street: {
        required
      },
      city: {
        required
      },
      region: {
        required
      },
      postalCode: {
        required
      },
      country: {
        required
      }
    }
  }
})
export default class BaseAddress extends Vue {
  /**
   * Contains the address (if any) to be edited, as a JSON string.
   */
  @Prop({ default: '{}' }) readonly addressJson!: string

  /**
   * Indicates whether the address should be shown in editing mode (true) display mode (false).
   */
  @Prop({ default: false }) readonly isEditing!: boolean

  /**
   * The address object that contains the fields edited by the component. This is the object equivalent of the
   * {@link addressJson} property.
   */
  private address: object = null

  /**
   * A copy of the address that the component was originally created with. This is used to determine whether or not the
   * address has been edited by the user.
   */
  private addressOriginal: object

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
    this.address = BaseAddress.jsonStringToObject(this.addressJson)
    this.addressOriginal = BaseAddress.jsonStringToObject(this.addressJson)

    // Let the parent know right away about the validity of the address.
    this.emitValidity()
  }

  /**
   * Lifecycle callback to store the mounted state of the component. We don't want the address watcher firing events
   * while the component is being set up.
   */
  private mounted () : void {
    this.isMounted = true
  }

  /**
   * Convenience method for loading the address object from the addressJson property string.
   */
  private static jsonStringToObject (json : string) : object {
    return JSON.parse(json || '{}')
  }

  /**
   * Emits an update message for the {@link addressJson} property, so that the caller can ".sync" with it.
   *
   * @returns a string representation of the address.
   */
  @Emit('update:addressJson')
  private emitAddressJson () : string {
    return JSON.stringify(this.address)
  }

  /**
   * Emits the validity state of the address entered by the user.
   *
   * @returns a boolean that is true if the address if valid, false otherwise.
   */
  @Emit('valid')
  private emitValidity () : boolean {
    return !this.$v.$invalid
  }

  /**
   * Emits the modified state of the address.
   *
   * @returns a boolean that is true if the address has been modified, false otherwise.
   */
  @Emit('modified')
  private emitModified () : boolean {
    return JSON.stringify(this.addressOriginal) !== JSON.stringify(this.address)
  }

  /**
   * Watches changes to the addressJson object, so that if the parent changes the data then the object copy of it that
   * backs the display will be updated.
   */
  @Watch('addressJson')
  private onAddressJsonChanged () : void {
    this.address = BaseAddress.jsonStringToObject(this.addressJson)
  }

  /**
   * Watches changes to the address object, to catch any changes to the fields within the address. Will notify the
   * parent object with the new address and whether or not the address is valid.
   */
  @Watch('address', { deep: true, immediate: true })
  private onAddressChanged () : void {
    // Don't do these until the component is mounted. Otherwise, it will be sending events during initialization.
    if (this.isMounted) {
      this.emitAddressJson()
      this.emitValidity()
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
