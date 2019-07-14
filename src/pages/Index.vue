<template lang="pug">
  q-page.flex.flex-center
    .col-auto.q-gutter-md
      .row.items-start.q-gutter-md
        q-card(dark).bg-dark
          q-img(:src="`https://imageserver.eveonline.com/Character/${id}_256.jpg`")
          q-card-section {{ name }}
            q-badge(color="primary").on-right.float-right {{ id }}
          q-card-section {{ corporation.name }} [{{ corporation.ticker }}]
            q-badge(color="primary").on-right.float-right {{ character.corporation_id }}
          q-card-section {{ alliance.name }} {{ alliance.ticker ? '[' + alliance.ticker + ']' : '' }}
            q-badge(color="primary").on-right.float-right {{ character.alliance_id ? character.alliance_id : 0 }}
        q-card(dark).bg-dark
          q-img(:src="`http://image.eveonline.com/Render/${ship.ship_type_id ? ship.ship_type_id : 11134}_256.png`")
          q-card-section {{ online.online ? 'Online' : 'Offline' }}
            q-toggle(v-if="online.online" v-model="tr" checked-icon="check" color="positive" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
            q-toggle(v-else v-model="fa" checked-icon="check" color="negative" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
          q-card-section
            q-icon(name="place").on-left
            | {{ solarSystemName }}
          q-card-section
            q-icon(name="flight").rotate-90.on-left
            | {{ shipType }}
            q-badge(color="primary").on-right {{ ship.ship_name }}
      .row.q-gutter-md
        q-btn(@click="refreshToken" color="primary") Refresh Token {{ token.slice(-8) }}
</template>

<style>
</style>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'PageIndex',
  data () {
    return {
      tr: true,
      fa: false,
      character: {},
      corporation: {},
      alliance: {},
      online: {},
      location: {},
      solarSystemName: '',
      ship: {},
      shipType: ''
    }
  },
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['auth', 'id', 'name', 'token']),
    bearer () {
      return btoa(`${process.env.CLIENT_ID}:${this.token}`)
    }
  },
  methods: {
    async getCharacter (id) {
      try {
        // const wes = await axios('https://api.github.com/users/wesbos');
        const characterPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/?datasource=tranquility`)
        this.character = characterPromise.data
        console.log(this.character)
        // many requests should be concurrent - don't slow things down!
        // fire off three requests and save their promises
        // const characterPromise = axios(`https://esi.evetech.net/latest/characters/${id}/?datasource=tranquility`)
        if (this.character.alliance_id > 0) {
          const corporationPromise = this.$axios(`https://esi.evetech.net/latest/corporations/${this.character.corporation_id}/?datasource=tranquility`)
          const alliancePromise = this.$axios(`https://esi.evetech.net/latest/alliances/${this.character.alliance_id}/?datasource=tranquility`)
          // await all three promises to come back and destructure the result into their own variables
          const [corporation, alliance] = await Promise.all([corporationPromise, alliancePromise])
          this.corporation = corporation.data
          this.alliance = alliance.data
        } else {
          const corporationPromise = await this.$axios(`https://esi.evetech.net/latest/corporations/${this.character.corporation_id}/?datasource=tranquility`)
          this.corporation = corporationPromise.data
          this.alliance = { name: 'No Alliance' }
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getOnline (id) {
      try {
        const onlinePromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/online/?datasource=tranquility`, { headers: { Authorization: `Bearer ${this.token}` } })
        this.online = onlinePromise.data
      } catch (e) {
        console.error(e)
      }
      setTimeout(this.getOnline, 60000, id)
    },
    async getLocation (id) {
      try {
        const locationPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/location/?datasource=tranquility`, { headers: { Authorization: `Bearer ${this.token}` } })
        this.location = locationPromise.data
        const systemPromise = await this.$axios(`https://esi.evetech.net/latest/universe/systems/${this.location.solar_system_id}/?datasource=tranquility`)
        this.solarSystemName = systemPromise.data.name
      } catch (e) {
        console.error(e)
      }
      setTimeout(this.getLocation, 5000, id)
    },
    async getShip (id) {
      try {
        const shipPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/ship/?datasource=tranquility`, { headers: { Authorization: `Bearer ${this.token}` } })
        this.ship = shipPromise.data
        const typePromise = await this.$axios(`https://esi.evetech.net/latest/universe/types/${this.ship.ship_type_id}/?datasource=tranquility`)
        this.shipType = typePromise.data.name
      } catch (e) {
        console.error(e)
      }
      setTimeout(this.getShip, 5000, id)
    },
    async refreshToken () {
      try {
        const tokenPromise = await this.$axios.post(`${process.env.API_PASS_URL}/refresh`, { token: this.token, client_ID: process.env.CLIENT_ID })
        this.token = tokenPromise.data.token
        this.$q.localStorage.set('token', this.token)
      } catch (e) {
        console.error(e)
      }
    }
  },
  async mounted () {
    if (this.$q.localStorage.has('auth')) { this.auth = this.$q.localStorage.getItem('auth') }
    if (!this.auth) {
      this.$router.push('login')
    } else {
      this.id = this.$q.localStorage.getItem('id')
      this.token = this.$q.localStorage.getItem('token')
      await this.getCharacter(this.$q.localStorage.getItem('id'))
      this.getOnline(this.id)
      this.getLocation(this.id)
      this.getShip(this.id)
    }
  }
}
</script>
