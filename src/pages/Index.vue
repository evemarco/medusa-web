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
          q-img(:src="`https://image.eveonline.com/Render/${ship.ship_type_id ? ship.ship_type_id : 670}_256.png`")
          q-card-section {{ online.online ? 'Online' : 'Offline' }}
            q-toggle(v-if="online.online" v-model="tr" checked-icon="check" color="positive" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
            q-toggle(v-else v-model="fa" checked-icon="check" color="negative" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
          q-card-section
            q-icon(name="place").on-left
            | {{ solarSystemName }}
            q-badge(v-if="solarSystemName" color="primary").on-right {{ location.solar_system_id }}
          q-card-section
            q-icon(name="flight").rotate-90.on-left
            | {{ shipType }}
            q-badge(v-if="ship.ship_name" color="primary").on-right {{ ship.ship_name }}
            q-badge(v-if="shipType" color="primary").on-right {{ ship.ship_type_id }}
        q-card(dark).bg-dark
          q-card-section.text-h5
            q-icon(name="group").on-left
            | Fleet
            q-toggle(v-if="fleet.fleet_id" v-model="tr" checked-icon="check" color="positive" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
            q-toggle(v-else v-model="fa" checked-icon="check" color="negative" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
          template(v-if="fleet.fleet_id")
            q-card-section You are in fleet
              q-badge(color="primary").on-right {{ fleet.fleet_id }}
            q-card-section Role
              q-badge(color="primary").on-right {{ fleet.role }}
            q-card-section Boss
              q-chip(v-if="id" dark color="dark" text-color="light").on-right
                q-avatar
                  img(:src="`https://imageserver.eveonline.com/Character/${fleet.fleet_boss_id}_64.jpg`")
                | {{ bossName }}
              q-badge(color="primary").on-right {{ fleet.fleet_boss_id }}
          template(v-else)
            q-card-section You are not in fleet
        q-card().bg-dark
          q-table(title="Fleet members" :data="dataMembers" :columns="columnsMembers" row-key="character_name" :pagination.sync="pagination" :sort-method="customSort" binary-state-sort dense dark color="primary" :loading="loadingMembers").bg-dark
            template(v-slot:body="props")
              q-tr(:props="props" :class="[{ 'fleet-commander': props.row.role === 'fleet_commander' }, { 'wing-commander': props.row.role === 'wing_commander' }, { 'squad-commander': props.row.role === 'squad_commander' }]")
                q-td(key="character_name" :props="props" :class="[{ ml10: props.row.role === 'wing_commander' }, { ml20: props.row.role === 'squad_commander' }, { ml30: props.row.role === 'squad_member' }]")
                  q-chip(dense dark color="dark" text-color="light")
                    q-avatar
                      img(:src="`https://imageserver.eveonline.com/Character/${props.row.character_id}_64.jpg`")
                    | {{ props.row.character_name }}
                  q-icon(name="stars" v-if="props.row.character_id === fleet.fleet_boss_id")
                q-td(key="ship_type_name" :props="props")
                  q-chip(dense dark color="dark" text-color="light")
                    q-avatar
                      img(:src="`https://image.eveonline.com/Render/${props.row.ship_type_id}_64.png`")
                    | {{ props.row.ship_type_name }}
                  q-icon(name="airplanemode_active" color="positive" v-if="props.row.takes_fleet_warp")
                  q-icon(name="airplanemode_inactive" color="negative" v-else)
                q-td(key="solar_system_name" :props="props") {{ props.row.solar_system_name }}
                  q-icon(name="home" v-if="props.row.station_id > 0")
                q-td(key="wing_id" :props="props")
                  q-badge(color="primary") {{ Math.floor(props.row.wing_id / 100000000) }}
                q-td(key="squad_id" :props="props")
                  q-badge(color="primary") {{ Math.floor(props.row.squad_id / 100000000) }}
      .row.q-gutter-md
        q-btn(@click="refreshToken" color="primary") Refresh Token {{ token.slice(-8) }}
</template>

<style>
</style>

<script>
import { mapFields } from 'vuex-map-fields'
import { Mutex } from 'async-mutex'
import { firstBy } from 'thenby'

const mutex = new Mutex()

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
      shipType: '',
      fleet: {},
      boss: {},
      bossName: '',
      members: [],
      loadingMembers: false,
      dataMembers: [],
      columnsMembers: [
        { name: 'character_name', align: 'left', label: 'Name', field: 'character_name', sortable: false },
        { name: 'ship_type_name', align: 'left', label: 'Ship', field: 'ship_type_name', sortable: false },
        { name: 'solar_system_name', align: 'center', label: 'System', field: 'solar_system_name', sortable: false },
        { name: 'wing_id', align: 'center', label: 'Wing', field: 'wing_id', sortable: false },
        { name: 'squad_id', align: 'center', label: 'Squad', field: 'squad_id', sortable: false }
      ],
      pagination: {
        sortBy: 'character_name',
        descending: false,
        page: 1,
        rowsPerPage: 50
        // rowsNumber: xx if getting data from a server
      },
      putFleet: {}
      // putFleet: {
      //   fleet_id: int64,
      //   fleet_boss_id: int32, // > 80000000
      //   fleet_boss_name: string, // ex: Psymon
      //   members: [{
      //     character_id: int32, // > 80000000
      //     character_name: string, // ex: Marionne
      //     join_time: string, // date string
      //     role: string, // [ fleet_commander, wing_commander, squad_commander, squad_member ]
      //     role_name: string, // ex: Commandant de flotte (boss)
      //     ship_type_id: int32, // < 100000
      //     ship_type_name: string, // ex: Stratios
      //     solar_system_id: int32, // (entre 30000000 et 39999999)
      //     solar_system_name: string, // ex: Jita
      //     squad_id: int64, // -1 si hors squad
      //     (non présent) station_id: int64, // station ou citadelle, station entre 60000000 et 69999999, citadelle > 1000000000
      //     takes_fleet_warp: boolean, // true si le perso peut prendre le warp de fleet
      //     wing_id: int64 // -1 si hors wing
      //   },
      //   {...},
      //   {...}]
      // }
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
    async getName (id) {
      if (id < 100000) {
        const response = await this.$axios(`https://esi.evetech.net/latest/universe/types/${id}/?datasource=tranquility`)
        return response.data.name
      } else if (id < 40000000) {
        const response = await this.$axios(`https://esi.evetech.net/latest/universe/systems/${id}/?datasource=tranquility`)
        return response.data.name
      } else {
        const response = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/?datasource=tranquility`)
        return response.data.name
      }
    },
    async getOnline (id) {
      try {
        const onlinePromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/online/?datasource=tranquility`, { headers: { Authorization: `Bearer ${this.token}` } })
        this.online = onlinePromise.data
        await this.getFleet(id)
      } catch (e) {
        console.error(e)
      }
      setTimeout(this.getOnline, 60000, id)
    },
    async getLocation (id) {
      try {
        const locationPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/location/?datasource=tranquility`, { headers: { Authorization: `Bearer ${this.token}` } })
        this.location = locationPromise.data
        let name = await this.getName(this.location.solar_system_id)
        this.solarSystemName = name
        // const systemPromise = await this.$axios(`https://esi.evetech.net/latest/universe/systems/${this.location.solar_system_id}/?datasource=tranquility`)
        // this.solarSystemName = systemPromise.data.name
      } catch (e) {
        console.error(e)
      }
      setTimeout(this.getLocation, 5000, id)
    },
    async getShip (id) {
      try {
        const shipPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/ship/?datasource=tranquility`, { headers: { Authorization: `Bearer ${this.token}` } })
        this.ship = shipPromise.data
        let name = await this.getName(this.ship.ship_type_id)
        this.shipType = name
        // const typePromise = await this.$axios(`https://esi.evetech.net/latest/universe/types/${this.ship.ship_type_id}/?datasource=tranquility`)
        // this.shipType = typePromise.data.name
      } catch (e) {
        console.error(e)
      }
      setTimeout(this.getShip, 5000, id)
    },
    async getFleet (id) {
      try {
        if (this.online.online) {
          const fleetPromise = await this.$axios(`https://esi.evetech.net/dev/characters/${id}/fleet/?datasource=tranquility`, { headers: { Authorization: `Bearer ${this.token}` } })
          this.fleet = fleetPromise.data
          // console.log(this.fleet)
          let name = await this.getName(this.fleet.fleet_boss_id)
          this.bossName = name
        }
        // const bossPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${this.fleet.fleet_boss_id}/?datasource=tranquility`)
        // this.boss = bossPromise.data
      } catch (e) {
        if (e.response.status === 404) {
          this.fleet = {}
        } else {
          console.error(e)
        }
      }
      // setTimeout(this.getFleet, 60000, id)
    },
    async getFleetMembers (id) {
      try {
        // console.log(this.fleet.fleet_id, this.fleet.fleet_boss_id, id)
        if (this.fleet.hasOwnProperty('fleet_id') && this.online.online && this.fleet.fleet_boss_id === id) {
          this.loadingMembers = true
          const membersPromise = await this.$axios(`https://esi.evetech.net/dev/fleets/${this.fleet.fleet_id}/members/?datasource=tranquility`, { headers: { Authorization: `Bearer ${this.token}` } })
          this.members = membersPromise.data
          // console.log(this.members)
          this.putFleet = {}
          this.putFleet.members = []
          this.putFleet.fleet_id = this.fleet.fleet_id
          this.putFleet.fleet_boss_id = this.fleet.fleet_boss_id
          this.putFleet.fleet_boss_name = this.bossName
          for (let member of this.members) {
            // console.log(member)
            const characterName = await this.getName(member.character_id)
            member.character_name = characterName
            const shipName = await this.getName(member.ship_type_id)
            member.ship_type_name = shipName
            const systemName = await this.getName(member.solar_system_id)
            member.solar_system_name = systemName
            this.putFleet.members.push(member)
          }
          this.dataMembers = this.putFleet.members
          setTimeout(() => { this.loadingMembers = false }, 1000)
          console.log(this.putFleet)
        } else {
          // console.log('Ignore fleetMembers')
          this.putFleet = {}
        }
      } catch (e) {
        this.loadingMembers = false
        console.error(e)
      }
      setTimeout(this.getFleetMembers, 5000, id)
    },
    async refreshToken () {
      try {
        console.log('Refresh Token')
        const tokenPromise = await this.$axios.post(`${process.env.API_PASS_URL}/refresh`, { token: this.token, client_ID: process.env.CLIENT_ID })
        this.token = tokenPromise.data.token
        this.$q.localStorage.set('token', this.token)
      } catch (e) {
        console.error(e)
      }
    },
    customSort (rows, sortBy, descending) {
      let data = [...rows]
      data.sort(firstBy('wing_id')
        .thenBy('squad_id')
        .thenBy('role')
        .thenBy('character_name'))
      return data
    }
  },
  async mounted () {
    if (this.$q.localStorage.has('auth')) { this.auth = this.$q.localStorage.getItem('auth') }
    if (!this.auth) {
      this.$router.push('login')
    } else {
      this.id = this.$q.localStorage.getItem('id')
      this.token = this.$q.localStorage.getItem('token')
      await this.getCharacter(this.id)
      this.getOnline(this.id)
      this.getLocation(this.id)
      this.getShip(this.id)
      // this.getFleet(this.id)
      this.getFleetMembers(this.id)
    }
  },
  created () {
    this.$axios.interceptors.response.use(response => {
      // Do something with response data
      return response
    }, async error => {
      // Do something with response error
      let errorResponse = error.response
      console.log(errorResponse)
      const oldToken = this.token
      const release = await mutex.acquire()
      try {
        if (errorResponse.status === 403 && errorResponse.data.sso_status === 401) {
          if (this.token === oldToken) await this.refreshToken()
          // this.$axios.interceptors.response.eject(this.axiosResponseInterceptor)
          error.config.headers.Authorization = `Bearer ${this.token}`
          // console.log(error.config)
          // return
          return this.$axios.request(error.config)
        }
      } catch (e) {
        return e
      } finally {
        release()
      }
    })
  }
}
</script>
