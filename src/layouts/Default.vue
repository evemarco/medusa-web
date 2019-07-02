<template lang="pug">
  q-layout(view="lHh Lpr lFf")
    q-header(elevated)
      q-toolbar(dark).bg-dark
        q-toolbar-title
          q-icon(name="img:statics/medusa-logo-white.svg" size="36px" @click.native="$router.push('/')").on-left.cursor-pointer
          q-btn(flat dense size="21px" @click="$router.push('/')" no-caps label="MEDUSA Project").logo-font.cursor-pointer
        q-chip(v-if="id" dark color="dark" text-color="light")
          q-avatar
            img(:src="`https://imageserver.eveonline.com/Character/${id}_64.jpg`")
          | {{ name }}
        q-btn(flat dense round @click="rightDrawerOpen = !rightDrawerOpen" aria-label="Options").on-right
          q-icon(name="menu")
    q-drawer(v-model="rightDrawerOpen" side="right" bordered content-class="bg-dark")
      q-list(dark)
        q-item-label(header) Menu
        q-item(clickable tag="a" @click="$router.push('login')")
          q-item-section(avatar)
            q-icon(name="exit_to_app")
          q-item-section
            q-item-label Login
        q-item(clickable tag="a" @click="$router.push('logout')")
          q-item-section(avatar)
            q-icon(name="exit_to_app").flip-horizontal
          q-item-section
            q-item-label Logout
        q-item(clickable tag="a" target="_blank" href="https://quasar.dev")
          q-item-section(avatar)
            q-icon(name="school")
          q-item-section
            q-item-label Quasar Docs
            q-item-label(caption) quasar.dev
    q-page-container
      router-view
</template>

<script>
import { openURL } from 'quasar'
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'MyLayout',
  data () {
    return {
      rightDrawerOpen: false
    }
  },
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['id', 'name', 'auth'])
  },
  mounted () {
    if (this.$q.localStorage.has('name')) { this.name = this.$q.localStorage.getItem('name') }
    if (this.$q.localStorage.has('id')) { this.id = this.$q.localStorage.getItem('id') }
    if (this.$q.localStorage.has('auth')) { this.auth = this.$q.localStorage.getItem('auth') }
  },
  methods: {
    openURL
  }
}
</script>

<style>
</style>
