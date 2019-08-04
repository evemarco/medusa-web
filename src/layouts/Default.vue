<template lang="pug">
  q-layout(view="lHh Lpr lFf")
    q-header(elevated)
      q-toolbar(dark).bg-dark
        q-toolbar-title
          q-icon(name="img:statics/medusa-logo-white.svg" size="36px" @click.native="$router.push('/')").on-left.cursor-pointer
          q-btn(flat dense size="21px" @click="$router.push('/')" no-caps label="MEDUSA Project").logo-font.cursor-pointer
          q-chip(flat dense dark :class="socketOn ? 'bg-positive' : 'bg-negative'" text-color="light").on-right WS
            q-tooltip Socket.IO {{ socketOn ? 'ON' : 'OFF' }}
        //- Character
        q-chip(v-if="id" dark color="dark" text-color="light")
          q-avatar
            img(:src="`https://imageserver.eveonline.com/Character/${id}_64.jpg`")
          | {{ name }}
          q-tooltip
            q-card().bg-dark
              q-img(:src="`https://imageserver.eveonline.com/Character/${id}_256.jpg`")
            q-card-section
              q-badge(color="positive" v-if="online.online") Online
              q-badge(color="negative" v-else) Offline
              q-badge(color="primary").on-right.float-right {{ id }}
            q-card-section {{ corporation.name }} [{{ corporation.ticker }}]
              q-badge(color="primary").on-right.float-right {{ character.corporation_id }}
            q-card-section {{ alliance.name }} {{ alliance.ticker ? '[' + alliance.ticker + ']' : '' }}
              q-badge(color="primary").on-right.float-right {{ character.alliance_id ? character.alliance_id : 0 }}
            q-card-section Access Token
              q-badge(color="primary").on-right.float-right ...{{ token.slice(-8) }}
        //- Online
        q-toggle(v-if="online.online" v-model="tr" checked-icon="check" color="positive" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
        q-toggle(v-else v-model="fa" checked-icon="check" color="negative" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
        //- Location
        q-chip(icon="place" dark color="dark" text-color="light" v-if="solarSystemName").on-right
          | {{ solarSystemName }}
          q-tooltip
            q-badge(color="primary") {{ location.solar_system_id }}
        //- Ship
        q-chip(dark color="dark" text-color="light" v-if="shipTypeName").on-right
          q-avatar
            img(:src="`https://image.eveonline.com/Render/${ship.ship_type_id ? ship.ship_type_id : 670}_64.png`")
          | {{ shipTypeName }}
          q-tooltip
            q-card(dark style="width: 20em").bg-dark.flex.flex-center
              q-img(:src="`https://image.eveonline.com/Render/${ship.ship_type_id ? ship.ship_type_id : 670}_256.png`")
              q-badge(color="primary").q-my-sm {{ ship.ship_type_id }}
              q-badge(color="primary").q-my-sm.on-right {{ ship.ship_name }}
        //- Menu
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
      tr: true,
      fa: false,
      rightDrawerOpen: false
    }
  },
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['id', 'name', 'auth', 'token', 'socketOn', 'character', 'corporation', 'alliance', 'online', 'solarSystemName', 'location', 'ship', 'shipTypeName'])
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
