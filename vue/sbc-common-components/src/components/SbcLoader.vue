<template>
  <v-overlay :value="show">
    <v-btn
            icon
            @click="overlay = false"
    >
      <v-progress-circular
              :indeterminate="indeterminate"
              :size="size"
              :width="width"
              :color="color"
              :z-index="zIndex"
      ></v-progress-circular>
      <span class="ml-3">{{message}}</span>
    </v-btn>
  </v-overlay>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import Vue from 'vue'

@Component({})
export default class SbcLoader extends Vue {
  @Prop({ default: false })
  private show!: boolean
  @Prop({ default: 'Account Switching In Progress' })
  private message!: string
  @Prop({ default: '' })
  private progressColor!: string
  private indeterminate = true
  private width = 4
  private size = 50
  private zIndex = 9
  private color = '#003366'
}
</script>

<style>
  .dialog.centered-dialog,
  .v-dialog.centered-dialog
  {
    background: #282c2dad;
    box-shadow: none;
    border-radius: 6px;
    width: auto;
    color: whitesmoke;
  }
</style>
