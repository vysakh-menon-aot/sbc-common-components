<template>
    <v-alert v-model="show" :type="type" :icon="icon" :dismissible = dismissible>
        {{ message }}
    </v-alert>
</template>

<script lang="ts">

import Vue from 'vue'
import '../plugins/vuetify'
import { Component, Prop } from 'vue-property-decorator'

@Component({})
export default class SbcSystemBanner extends Vue {
    @Prop({ default: '' }) message: string
    @Prop({ default: 'info' }) type: string // Accepted values are 'info', 'warning', 'danger', 'success',
    @Prop({ default: 'info' }) icon: string // See https://material.io/resources/icons/?style=baseline for accepted values
    @Prop({ default: false }) show: boolean
    @Prop({ default: false }) dismissible: boolean

    mounted () {
    }
}
</script>

<style lang="scss" scoped>
    .v-alert {
        margin: 0;
        padding: 0;
        border: none;
        border-radius: 0;
    }

    .v-alert ::v-deep .v-alert__wrapper {
        margin: 0 auto;
        padding: 1.25rem 1.5rem;
        max-width: 1200px;
        overflow: hidden;
    }
</style>
