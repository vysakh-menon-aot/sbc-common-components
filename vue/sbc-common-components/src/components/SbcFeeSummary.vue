<template>
  <v-card>
    <header class="font-weight-bold px-3 py-3">
      <slot name="header">Fee Summary</slot>
    </header>

    <div v-show="fetchError">
      <v-alert color="error" icon="warning" outlined>{{fetchError}}</v-alert>
    </div>

    <v-slide-y-transition group tag="ul" class="fee-list" v-show="!fetchError">
      <li class="container fee-list__item"
        v-show="(totalFilingFees > 0 && lineItem.fee) || (totalFilingFees == 0)"
        v-for="lineItem in fees"
        :key="lineItem.filingType"
      >
        <div class="fee-list__item-name">{{lineItem.filingType}}</div>
        <div class="fee-list__item-value">{{lineItem.fee > 0 ? (lineItem.fee | currency) : 'No Fee'}}</div>
      </li>
    </v-slide-y-transition>

    <div class="container fee-total" v-show="!fetchError">
      <div class="fee-total__name">Total Fees</div>
      <div class="fee-total__currency">CAD</div>
      <div class="fee-total__value">
        <v-slide-y-reverse-transition name="slide" mode="out-in">
          <div>{{totalFilingFees | currency}}</div>
        </v-slide-y-reverse-transition>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import '../plugins/vuetify'
import FeeServices from '../services/fee.services'
import { Fee } from '../models/fee'

@Component({})
export default class SbcFeeSummary extends Vue {
  /**
   * This prop is an array of filing data. Each item should contain:
   *   filingDescription: Optional. If exists, it will be displayed.
   *                      Or else what ever comes from service call will be shown.
   *   filingTypeCode: Mandatory. Example: OTADD, OTANN, etc
   *   entityType: Example: CP.
   */

  @Prop({ default: [] })
  private filingData: { filingDescription: string, filingTypeCode: string, entityType: string }[]

  @Prop({ default: '' })
  private payURL: string

  /* class properties */
  private fees: Fee[] = []
  private fetchError: string = ''

  /* lifecycle event */
  private mounted (): void {
    // console.log('%c FeeModule-Data Received on Mount as %s %s', 'color: blue; font-size: 12px',
    //   JSON.stringify(this.filingData), this.payURL)

    FeeServices.getFee(this.filingData, this.payURL)
      .then(data => {
        this.fetchError = ''
        this.fees = data
        this.emitTotalFee(this.totalFilingFees)
      })
      .catch((error: any) => {
        this.fetchError = 'Error fetching fees' + error
      })
  }

  /* getter */
  private get totalFilingFees (): number {
    return this.fees.reduce((acc: number, item: { fee: number }) => acc + item.fee, 0)
  }

  /* watcher */
  @Watch('filingData')
  private onFilingDataChanged (val: string, oldVal: string): void {
    // console.log('%c FeeModule-Watch Activated as %s', 'color: blue; font-size: 12px',
    //   JSON.stringify(this.filingData))

    FeeServices.getFee(this.filingData, this.payURL).then((data: any) => {
      this.fetchError = ''
      this.fees = data
      this.emitTotalFee(this.totalFilingFees)
    }).catch((error: any) => {
      this.fetchError = 'Error fetching fees' + error
    })
  }

  /* emitter */
  @Emit('total-fee')
  private emitTotalFee (val: number): void {}
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/theme.scss";

header {
  color: #fff;
  background: $BCgovBlue5;
}

.container {
  display: flex;
  flex-flow: row nowrap;
  line-height: 1.2rem;
  font-size: 0.875rem;
}

.fee-list {
  border-bottom: 1px solid $gray3;
}

.fee-list__item {
  &-name, &-value {
    font-weight: 700;
  }

  &-name {
    flex: 1 1 auto;
    margin-right: 2rem;
  }

  &-value {
    flex: 0 0 auto;
    text-align: right;
  }
}

.fee-list__item + .fee-list__item {
  border-top: 1px solid $gray3;
}

.fee-total {
  align-items: center;
  letter-spacing: -0.01rem;
  line-height: auto;

  &__name {
    flex: 1 1 auto;
    margin-right: auto;
    font-weight: 700;
  }

  &__currency {
    margin-right: 0.5rem;
    color: $gray5;
    font-weight: 500;
  }

  &__value {
    font-size: 1.65rem;
    font-weight: 700;
  }
}
</style>
