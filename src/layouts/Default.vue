<template lang="pug">
  q-layout(view="lHh Lpr lFf")
    q-header(elevated)
      q-toolbar
        q-toolbar-title
          q-icon(name="img:statics/app-logo-128x128.png")
          |  Medusa Web
        div Quasar v{{ $q.version }}
        q-btn(flat dense round @click="rightDrawerOpen = !rightDrawerOpen" aria-label="Options").on-right
          q-icon(name="menu")
    q-drawer(v-model="rightDrawerOpen" side="right" bordered content-class="bg-grey-2")
      q-list
        q-item-label(header) Essential Links
        q-item(clickable tag="a" target="_blank" href="https://quasar.dev")
          q-item-section(avatar)
            q-icon(name="school")
          q-item-section
            q-item-label Docs
            q-item-label(caption) quasar.dev
    q-page-container
      router-view
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'MyLayout',
  data () {
    return {
      rightDrawerOpen: false
    }
  },
  methods: {
    openURL
  }
}
</script>

<style>
</style>
