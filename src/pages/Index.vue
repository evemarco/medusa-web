<template lang="pug">
  q-page.flex.flex-center
    .col-auto
      .row.items-start.q-gutter-md
        q-card(dark).bg-dark
          q-img(:src="`https://imageserver.eveonline.com/Character/${id}_256.jpg`")
          q-card-section {{ name }}
            q-badge(color="primary").on-right.float-right {{ id }}
          q-card-section {{ corporation.name }} [{{ corporation.ticker }}]
            q-badge(color="primary").on-right.float-right {{ character.corporation_id }}
          q-card-section {{ alliance.name }} [{{ alliance.ticker }}]
            q-badge(color="primary").on-right.float-right {{ character.alliance_id }}
        q-card(dark).bg-dark
          q-img(:src="`http://image.eveonline.com/Render/11379_256.png`")
          q-card-section Online
            q-toggle(v-if="online" v-model="online" checked-icon="check" color="positive" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
            q-toggle(v-else v-model="online" checked-icon="check" color="negative" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
          q-card-section Location
          q-card-section Ship
      .row
        h3.text-light More soon
</template>

<style>
</style>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'PageIndex',
  data () {
    return {
      character: {},
      corporation: {},
      alliance: {},
      online: true
    }
  },
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['auth', 'id', 'name'])
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
        const corporationPromise = this.$axios(`https://esi.evetech.net/latest/corporations/${this.character.corporation_id}/?datasource=tranquility`)
        const alliancePromise = this.$axios(`https://esi.evetech.net/latest/alliances/${this.character.alliance_id}/?datasource=tranquility`)
        // await all three promises to come back and destructure the result into their own variables
        const [corporation, alliance] = await Promise.all([corporationPromise, alliancePromise])
        this.corporation = corporation.data
        this.alliance = alliance.data
        console.log(corporation.data, alliance.data)
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
      await this.getCharacter(this.$q.localStorage.getItem('id'))
    }
  }
}
</script>
