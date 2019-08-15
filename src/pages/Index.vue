<template lang="pug">
  q-page(style="min-height: 0px;")
    .flex.q-ml-md.q-mt-md
      .row.q-gutter-md.content-start
        q-card(style="width: calc((100vw - (16px * 3 + 2px)) * 0.6); height: calc((100vh - 50px - (16px * 3)) * 0.6);").bg-dark
          q-table(title="Fleet members" :data="maskSelected ? filteredData : membersData" :columns="columnsMembers" selection="multiple" :selected.sync="selected" @selection="(details) => filterData(details)" row-key="character_id" :pagination.sync="pagination" :sort-method="customSort" binary-state-sort dense dark color="primary" :loading="loadingMembers").bg-dark.toptable
            //- Barre titre gauche de la table Fleet
            template(v-slot:top-left)
              .q-table__title
                q-icon(name="group").on-left
                | Fleet
                q-badge(color="primary" v-if="fleet.fleet_id").on-right.vertical-middle {{ fleet.fleet_id }}
                  q-tooltip
                    q-card.bg-dark
                      q-card-section Role
                        q-badge(color="primary").on-right {{ fleet.role }}
                      q-card-section Boss
                        q-chip(v-if="session.id" dark color="dark" text-color="light").on-right
                          q-avatar
                            img(:src="`https://imageserver.eveonline.com/Character/${fleet.fleet_boss_id}_64.jpg`")
                          | {{ bossName }}
                        q-badge(color="primary").on-right {{ fleet.fleet_boss_id }}
                q-btn(dense dark :color="maskSelected ? 'positive' : 'negative'" icon="visibility" size="sm" @click="maskSelected = !maskSelected" :label="`Mask ${maskSelected ? 'On' : 'Off'}`").on-right
                  q-tooltip Mask selected members if activated
            //- Barre titre droite de la table Fleet
            template(v-slot:top-right)
              div Mass: {{ Math.round(totalMass / 1000000) }} M kg
                q-tooltip
                  q-card.bg-dark
                    q-card-section Mass of ships fleet: {{ totalMass / 1000000 }} M kg
                    q-card-section It does not includ selected members,
                      br
                      | rigs, plates, AB / MWD activated
              q-toggle(v-if="fleet.fleet_id" v-model="tr" checked-icon="check" color="positive" unchecked-icon="clear" dark keep-color dense).on-right.float-right.cursor-not-allowed
                q-tooltip You are in a fleet
              q-toggle(v-else v-model="fa" checked-icon="check" color="negative" unchecked-icon="clear" dark keep-color dense).on-right.float-right.cursor-not-allowed
                q-tooltip You aren't in a fleet
            //- Données table Fleet
            template(v-slot:body="props")
              q-tr(:props="props" :class="[{ 'fleet-commander': props.row.role === 'fleet_commander' }, { 'wing-commander': props.row.role === 'wing_commander' }, { 'squad-commander': props.row.role === 'squad_commander' }]")
                q-td(auto-width)
                  q-checkbox(dense v-model="props.selected" dark)
                q-td(key="character_name" :props="props" :class="[{ ml10: props.row.role === 'wing_commander' }, { ml20: props.row.role === 'squad_commander' }, { ml30: props.row.role === 'squad_member' }]")
                  q-chip(dense dark color="dark" text-color="light")
                    q-avatar
                      img(:src="`https://imageserver.eveonline.com/Character/${props.row.character_id}_64.jpg`")
                    | {{ props.row.character_name }}
                  q-icon(name="stars" v-if="props.row.character_id === fleet.fleet_boss_id")
                  q-tooltip
                    q-card.bg-dark
                      q-card-section
                        q-badge(color="primary").on-right {{ props.row.character_id }}
                      q-card-section Fleet joined
                        timeago(:datetime="props.row.join_time").on-right
                q-td(key="corporation_ticker" :props="props") {{ props.row.corporation_ticker }}
                  q-tooltip
                    q-card.bg-dark
                      q-card-section {{ props.row.corporation_name }}
                        q-badge(color="primary").on-right {{ props.row.corporation_id }}
                      q-card-section(v-if="props.row.alliance_id") {{ props.row.alliance_name }}
                        q-badge(color="primary").on-right {{ props.row.alliance_id }}
                q-td(key="ship_type_name" :props="props")
                  q-chip(dense dark color="dark" text-color="light")
                    q-avatar
                      img(:src="`https://image.eveonline.com/Render/${props.row.ship_type_id}_64.png`")
                    | {{ props.row.ship_type_name }}
                    q-tooltip
                      q-card.bg-dark
                        q-card-section
                          q-badge(color="primary").on-right {{ props.row.ship_type_id }}
                        q-card-section Mass: {{ props.row.ship_type_mass / 1000000 }} M kg
                  q-icon(name="airplanemode_active" color="positive" v-if="props.row.takes_fleet_warp")
                    q-tooltip(content-class="bg-dark")  Can warp fleet
                  q-icon(name="airplanemode_inactive" color="negative" v-else)
                    q-tooltip(content-class="bg-dark") Can't warp fleet
                q-td(key="solar_system_name" :props="props") {{ props.row.solar_system_name }}
                  q-icon(name="home" v-if="props.row.station_id > 0")
                  q-tooltip(content-class="bg-dark")
                    q-badge(color="primary") {{ props.row.solar_system_id }}
                q-td(key="jumps" :props="props") {{ props.row.jumps }}
                q-td(key="wing_id" :props="props") {{ props.row.wing_name }}
                  q-tooltip
                    q-card.bg-dark
                      q-card-section
                        q-badge(color="primary") {{ props.row.wing_id }}
                      q-card-section {{ props.row.role_name }}
                q-td(key="squad_id" :props="props") {{ props.row.squad_name }}
                  q-tooltip
                    q-card.bg-dark
                      q-card-section
                        q-badge(color="primary") {{ props.row.squad_id }}
                      q-card-section {{ props.row.role_name }}
            template(v-slot:bottom="props")
        q-card(style="width: calc((100vw - (16px * 3 + 2px)) * 0.4); height: calc((100vh - 50px - (16px * 3)) * 0.6);").bg-dark
          q-table(title="Opponents (demo)" dense dark :data="opponentsData" :columns="columnsOpponents" :pagination.sync="pagination").bg-dark.toptable
            //- Données table Opponents
            template(v-slot:body="props")
              q-tr(:props="props")
                q-td(key="opponent_name" :props="props")
                  q-chip(dense dark color="dark" text-color="light")
                    q-avatar
                      img(:src="`https://imageserver.eveonline.com/Character/${props.row.id}_64.jpg`")
                    | {{ props.row.name }}
                  q-tooltip
                    q-badge(color="primary") {{ props.row.id }}
                q-td(key="opponent_corp_name" :props="props") {{ props.row.corporation_ticker }}
                  q-tooltip
                    q-card.bg-dark
                      q-card-section {{ props.row.corporation_name }}
                        q-badge(color="primary").on-right {{ props.row.corporation_id }}
                      q-card-section(v-if="props.row.alliance_id") {{ props.row.alliance_name }}
                        q-badge(color="primary").on-right {{ props.row.alliance_id }}
                q-td(key="opponent_ship_type_name" :props="props")
                  q-chip(dense dark color="dark" text-color="light")
                    q-avatar
                      img(:src="`https://image.eveonline.com/Render/${props.row.ship_type_id}_64.png`")
                    | {{ props.row.ship_type_name }}
                    q-tooltip
                      q-badge(color="primary") {{ props.row.ship_type_id }}
                q-td(key="opponent_actions" :props="props")
                  q-btn(dense flat v-if="props.row.dps" icon="img:https://image.eveonline.com/Type/561_64.png")
                    q-tooltip DPS
                  q-btn(dense flat v-if="props.row.scramble" icon="img:https://image.eveonline.com/Type/447_64.png")
                    q-tooltip Scramble
                  q-btn(dense flat v-if="props.row.disrupt" icon="img:https://image.eveonline.com/Type/3242_64.png")
                    q-tooltip Disrupt
                  q-btn(dense flat v-if="props.row.web" icon="img:https://image.eveonline.com/Type/526_64.png")
                    q-tooltip Web
                  q-btn(dense flat v-if="props.row.neutra" icon="img:https://image.eveonline.com/Type/533_64.png")
                    q-tooltip Neutra
                  q-btn(dense flat v-if="props.row.ecm" icon="img:https://image.eveonline.com/Type/1957_64.png")
                    q-tooltip ECM
                  //- q-badge(color="red" floating) 1
            template(v-slot:bottom="props")
        q-card(style="width: calc((100vw - (16px * 3 + 2px)) * 0.5); height: calc((100vh - 50px - (16px * 3)) * 0.4").bg-dark.flex
          .row.no-warp
            .col-9
              q-table(title="Defense - tank (demo)" style="width: calc((100vw - 48px) * 0.5 *0.75);" flat dense dark :data="attacksUsData" :columns="columnsAttacks" :pagination.sync="pagination").bg-dark.bottomtable
                //- Données table Attacks on Us
                template(v-slot:body="props")
                  q-tr(:props="props")
                    q-td(key="opponent_name" :props="props")
                      q-chip(dense dark color="dark" text-color="light")
                        q-avatar
                          img(:src="`https://imageserver.eveonline.com/Character/${props.row.id}_64.jpg`")
                        | {{ props.row.name }}
                      q-tooltip
                        q-badge(color="primary") {{ props.row.id }}
                    q-td(key="opponent_corp_name" :props="props") {{ props.row.corporation_ticker }}
                      q-tooltip
                        q-card.bg-dark
                          q-card-section {{ props.row.corporation_name }}
                            q-badge(color="primary").on-right {{ props.row.corporation_id }}
                          q-card-section(v-if="props.row.alliance_id") {{ props.row.alliance_name }}
                            q-badge(color="primary").on-right {{ props.row.alliance_id }}
                    q-td(key="opponent_ship_type_name" :props="props")
                      q-chip(dense dark color="dark" text-color="light")
                        q-avatar
                          img(:src="`https://image.eveonline.com/Render/${props.row.ship_type_id}_64.png`")
                        | {{ props.row.ship_type_name }}
                        q-tooltip
                          q-badge(color="primary") {{ props.row.ship_type_id }}
                    q-td(key="opponent_actions" :props="props")
                      q-btn(dense flat v-if="props.row.dps" icon="img:https://image.eveonline.com/Type/561_64.png")
                        q-tooltip  {{ props.row.dps }} DPS
                      q-btn(dense flat v-if="props.row.scramble" icon="img:https://image.eveonline.com/Type/447_64.png")
                        q-badge(color="negative" floating transparent) {{ props.row.scramble }}
                        q-tooltip Scramble
                      q-btn(dense flat v-if="props.row.disrupt" icon="img:https://image.eveonline.com/Type/3242_64.png")
                        q-badge(color="negative" floating transparent) {{ props.row.disrupt }}
                        q-tooltip Disrupt
                      q-btn(dense flat v-if="props.row.web" icon="img:https://image.eveonline.com/Type/526_64.png")
                        q-badge(color="negative" floating transparent) {{ props.row.web }}
                        q-tooltip Web
                      q-btn(dense flat v-if="props.row.neutra" icon="img:https://image.eveonline.com/Type/533_64.png")
                        q-badge(color="negative" floating transparent) {{ props.row.neutra }}
                        q-tooltip Neutra
                      q-btn(dense flat v-if="props.row.ecm" icon="img:https://image.eveonline.com/Type/1957_64.png")
                        q-badge(color="negative" floating transparent) {{ props.row.ecm }}
                        q-tooltip ECM
                template(v-slot:bottom="props")
            .col-3
              .text-light.text-right.q-mt-sm.q-mr-sm {{ dataset[dataset.length-1][1] }} DPS
              column-chart(label="DPS" :data="dataset" :library="datasetOptions" :colors="['#DC3545']" id="left-chart")
        q-card(style="width: calc((100vw - (16px * 3 + 2px)) * 0.5); height: calc((100vh - 50px - (16px * 3)) * 0.4").bg-dark.flex
          .row.no-warp
            .col.col-9
              q-table(title="DPS / Ewar applied (demo)" style="width: calc((100vw - 48px) * 0.5 *0.75);" flat dense dark :data="attacksOpponentsData" :columns="columnsAttacks" :pagination.sync="pagination").bg-dark.bottomtable
                //- Données table Attacks on Opponents
                template(v-slot:body="props")
                  q-tr(:props="props")
                    q-td(key="opponent_name" :props="props")
                      q-chip(dense dark color="dark" text-color="light")
                        q-avatar
                          img(:src="`https://imageserver.eveonline.com/Character/${props.row.id}_64.jpg`")
                        | {{ props.row.name }}
                      q-tooltip
                        q-badge(color="primary") {{ props.row.id }}
                    q-td(key="opponent_corp_name" :props="props") {{ props.row.corporation_ticker }}
                      q-tooltip
                        q-card.bg-dark
                          q-card-section {{ props.row.corporation_name }}
                            q-badge(color="primary").on-right {{ props.row.corporation_id }}
                          q-card-section(v-if="props.row.alliance_id") {{ props.row.alliance_name }}
                            q-badge(color="primary").on-right {{ props.row.alliance_id }}
                    q-td(key="opponent_ship_type_name" :props="props")
                      q-chip(dense dark color="dark" text-color="light")
                        q-avatar
                          img(:src="`https://image.eveonline.com/Render/${props.row.ship_type_id}_64.png`")
                        | {{ props.row.ship_type_name }}
                        q-tooltip
                          q-badge(color="primary") {{ props.row.ship_type_id }}
                    q-td(key="opponent_actions" :props="props")
                      q-btn(dense flat v-if="props.row.dps" icon="img:https://image.eveonline.com/Type/561_64.png")
                        q-tooltip {{ props.row.dps }} DPS
                      q-btn(dense flat v-if="props.row.scramble" icon="img:https://image.eveonline.com/Type/447_64.png")
                        q-badge(color="positive" floating transparent) {{ props.row.scramble }}
                        q-tooltip Scramble
                      q-btn(dense flat v-if="props.row.disrupt" icon="img:https://image.eveonline.com/Type/3242_64.png")
                        q-badge(color="positive" floating transparent) {{ props.row.disrupt }}
                        q-tooltip Disrupt
                      q-btn(dense flat v-if="props.row.web" icon="img:https://image.eveonline.com/Type/526_64.png")
                        q-badge(color="positive" floating transparent) {{ props.row.web }}
                        q-tooltip Web
                      q-btn(dense flat v-if="props.row.neutra" icon="img:https://image.eveonline.com/Type/533_64.png")
                        q-badge(color="positive" floating transparent) {{ props.row.neutra }}
                        q-tooltip Neutra
                      q-btn(dense flat v-if="props.row.ecm" icon="img:https://image.eveonline.com/Type/1957_64.png")
                        q-badge(color="positive" floating transparent) {{ props.row.ecm }}
                        q-tooltip ECM
                template(v-slot:bottom="props")
            .col.col-3
              .text-light.text-right.q-mt-sm.q-mr-sm {{ dataset2[dataset2.length-1][1] }} DPS
              column-chart(label="DPS" :data="dataset2" :library="datasetOptions" :colors="['#28A745']" id="right-chart")
</template>

<style>
</style>

<script>
import { mapFields } from 'vuex-map-fields'
import { Mutex } from 'async-mutex'
import { firstBy } from 'thenby'
import io from 'socket.io-client'

const socket = io(process.env.SOCKET_IO)

const mutex = new Mutex()

export default {
  name: 'PageIndex',
  data () {
    return {
      // dataset: [32, 500, 1492, 1200], 15 max
      dataset: [['2019-08-14T09:29:30Z', 0], ['2019-08-14T09:29:40Z', 72], ['2019-08-14T09:29:50Z', 0], ['2019-08-14T09:30:00Z', 32], ['2019-08-14T09:30:10Z', 500], ['2019-08-14T09:30:20Z', 1492], ['2019-08-14T09:30:30Z', 1200], ['2019-08-14T09:30:40Z', 999], ['2019-08-14T09:30:50Z', 1229], ['2019-08-14T09:31:00Z', 685], ['2019-08-14T09:31:10Z', 999], ['2019-08-14T09:31:20Z', 999], ['2019-08-14T09:31:30Z', 999], ['2019-08-14T09:31:40Z', 999], ['2019-08-14T09:31:50Z', 756]],
      dataset2: [['2019-08-14T09:29:30Z', 100], ['2019-08-14T09:29:40Z', 172], ['2019-08-14T09:29:50Z', 450], ['2019-08-14T09:30:00Z', 560], ['2019-08-14T09:30:10Z', 800], ['2019-08-14T09:30:20Z', 820], ['2019-08-14T09:30:30Z', 750], ['2019-08-14T09:30:40Z', 820], ['2019-08-14T09:30:50Z', 896], ['2019-08-14T09:31:00Z', 980], ['2019-08-14T09:31:10Z', 800], ['2019-08-14T09:31:20Z', 478], ['2019-08-14T09:31:30Z', 589], ['2019-08-14T09:31:40Z', 258], ['2019-08-14T09:31:50Z', 489]],
      datasetOptions: {
        hover: {
          intersect: false,
          mode: 'index',
          axis: 'x'
        },
        tooltips: {
          intersect: false,
          mode: 'index',
          axis: 'x'
        },
        scales: {
          xAxes: [{
            ticks: {
              callback: function (value, index, values) {
                return ''
              }
            },
            barPercentage: 0.9
          }]
        }
      },
      tr: true,
      fa: false,
      selected: [],
      selectedSet: new Set(),
      maskSelected: false,
      totalMass: 0,
      filteredData: [],
      // character: {},
      // corporation: {},
      // alliance: {},
      // online: {},
      // location: {},
      // solarSystemName: '',
      // ship: {},
      // shipTypeName: '',
      fleet: {},
      boss: {},
      bossName: '',
      members: [],
      loadingMembers: false,
      membersData: [],
      columnsMembers: [
        { name: 'character_name', align: 'left', label: 'Name', field: 'character_name', sortable: false },
        { name: 'corporation_ticker', align: 'center', label: 'Corp', field: 'corporation_ticker', sortable: false },
        { name: 'ship_type_name', align: 'left', label: 'Ship', field: 'ship_type_name', sortable: false },
        { name: 'solar_system_name', align: 'center', label: 'System', field: 'solar_system_name', sortable: false },
        { name: 'jumps', align: 'center', label: 'Jumps', field: 'jumps', sortable: false },
        { name: 'wing_id', align: 'center', label: 'Wing', field: 'wing_id', sortable: false },
        { name: 'squad_id', align: 'center', label: 'Squad', field: 'squad_id', sortable: false }
      ],
      opponentsData: [
        { name: 'adward kisaragi', id: 2112237020, corporation_name: 'Fish Vending Machine', corporation_ticker: 'FSHVM', corporation_id: 98494391, ship_type_name: 'Gnosis', ship_type_id: 3756, dps: 400, neutra: 0, scramble: 1, disrupt: 1, web: 0, ecm: 1 },
        { name: 'Nae In Saeng', id: 2114754085, corporation_name: 'Fish Vending Machine', corporation_ticker: 'FSHVM', corporation_id: 98494391, ship_type_name: 'Vindicator', ship_type_id: 17740, dps: 400, neutra: 0, scramble: 0, disrupt: 0, web: 1, ecm: 0 },
        { name: 'ewqqw kinux98', id: 2115175252, corporation_name: 'Fish Vending Machine', corporation_ticker: 'FSHVM', corporation_id: 98494391, ship_type_name: 'Bhaalgorn', ship_type_id: 17920, dps: 0, neutra: 1, scramble: 0, disrupt: 0, web: 0, ecm: 0 },
        { name: 'BaySalt', id: 94740066, corporation_name: 'Fish Vending Machine', corporation_ticker: 'FSHVM', corporation_id: 98494391, ship_type_name: 'Leshak', ship_type_id: 47271, dps: 400, neutra: 1, scramble: 0, disrupt: 0, web: 1, ecm: 0 },
        { name: 'Baysalt Delta', id: 2115022711, corporation_name: 'Fish Vending Machine', corporation_ticker: 'FSHVM', corporation_id: 98494391, ship_type_name: 'Sabre', ship_type_id: 22456, dps: 400, neutra: 0, scramble: 1, disrupt: 0, web: 0, ecm: 0 },
        { name: 'Toon 2', id: 0, corporation_name: 'Goonswarm Federation', corporation_ticker: 'CONDI', corporation_id: 1354830081, ship_type_name: 'Gnosis', ship_type_id: 3756, dps: 400, neutra: 0, scramble: 0, disrupt: 0, web: 0, ecm: 0 },
        { name: 'Toon 1', id: 0, corporation_name: 'Goonswarm Federation', corporation_ticker: 'CONDI', corporation_id: 1354830081, ship_type_name: 'Gnosis', ship_type_id: 3756, dps: 400, neutra: 0, scramble: 0, disrupt: 0, web: 0, ecm: 0 },
        { name: 'Toon 3', id: 0, corporation_name: 'Goonswarm Federation', corporation_ticker: 'CONDI', corporation_id: 1354830081, ship_type_name: 'Gnosis', ship_type_id: 3756, dps: 400, neutra: 0, scramble: 0, disrupt: 0, web: 0, ecm: 0 },
        { name: 'Toon 4', id: 0, corporation_name: 'Goonswarm Federation', corporation_ticker: 'CONDI', corporation_id: 1354830081, ship_type_name: 'Gnosis', ship_type_id: 3756, dps: 400, neutra: 0, scramble: 0, disrupt: 0, web: 0, ecm: 0 },
        { name: 'Toon 5', id: 0, corporation_name: 'Goonswarm Federation', corporation_ticker: 'CONDI', corporation_id: 1354830081, ship_type_name: 'Gnosis', ship_type_id: 3756, dps: 400, neutra: 0, scramble: 0, disrupt: 0, web: 0, ecm: 0 },
        { name: 'Toon 6', id: 0, corporation_name: 'Goonswarm Federation', corporation_ticker: 'CONDI', corporation_id: 1354830081, ship_type_name: 'Gnosis', ship_type_id: 3756, dps: 400, neutra: 0, scramble: 0, disrupt: 0, web: 0, ecm: 0 },
        { name: 'Toon 7', id: 0, corporation_name: 'Goonswarm Federation', corporation_ticker: 'CONDI', corporation_id: 1354830081, ship_type_name: 'Gnosis', ship_type_id: 3756, dps: 400, neutra: 0, scramble: 0, disrupt: 0, web: 0, ecm: 0 }
      ],
      attacksUsData: [
        { name: 'Marionne', id: 93850133, corporation_name: 'Hidden Baguette', corporation_ticker: 'BAG8', corporation_id: 98591576, ship_type_name: 'Leshak', ship_type_id: 47271, dps: 968, neutra: 2, scramble: 1, disrupt: 0, web: 0, ecm: 1 },
        { name: 'XOS Psymon', id: 1653852557, corporation_name: 'Ehefkae', corporation_ticker: 'KAE.', corporation_id: 98599547, ship_type_name: 'Damnation', ship_type_id: 22474, dps: 156, neutra: 0, scramble: 0, disrupt: 1, web: 1, ecm: 0 }
      ],
      attacksOpponentsData: [
        { name: 'ewqqw kinux98', id: 2115175252, corporation_name: 'Fish Vending Machine', corporation_ticker: 'FSHVM', corporation_id: 98494391, ship_type_name: 'Vindicator', ship_type_id: 17740, dps: 1856, neutra: 1, scramble: 0, disrupt: 0, web: 0, ecm: 0 },
        { name: 'Baysalt Delta', id: 2115022711, corporation_name: 'Fish Vending Machine', corporation_ticker: 'FSHVM.', corporation_id: 98494391, ship_type_name: 'Sabre', ship_type_id: 22456, dps: 159, neutra: 0, scramble: 0, disrupt: 1, web: 1, ecm: 0 }
      ],
      columnsOpponents: [
        { name: 'opponent_name', align: 'left', label: 'Name', field: 'name', sortable: false },
        { name: 'opponent_corp_name', align: 'center', label: 'Corp', field: 'corporation_ticker', sortable: false },
        { name: 'opponent_ship_type_name', align: 'left', label: 'Ship', field: 'ship_type_name', sortable: false },
        { name: 'opponent_actions', align: 'left', label: 'Actions', sortable: false }
      ],
      columnsAttacks: [
        { name: 'opponent_name', align: 'left', label: 'Name', field: 'name', sortable: false },
        { name: 'opponent_corp_name', align: 'center', label: 'Corp', field: 'corporation_ticker', sortable: false },
        { name: 'opponent_ship_type_name', align: 'left', label: 'Ship', field: 'ship_type_name', sortable: false },
        { name: 'opponent_actions', align: 'left', label: 'Actions', sortable: false }
      ],
      pagination: {
        sortBy: 'character_name',
        descending: false,
        page: 1,
        rowsPerPage: 10000
        // rowsNumber: xx if getting data from a server
      },
      receiveFleet: false,
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
      //     squad_name: string,
      //     (non présent, bug CCP) station_id: int64, // station ou citadelle, station entre 60000000 et 69999999, citadelle > 1000000000
      //     takes_fleet_warp: boolean, // true si le perso peut prendre le warp de fleet
      //     wing_id: int64 // -1 si hors wing
      //     wing_name: string,
      //   },
      //   {...},
      //   {...}]
      // }
    }
  },
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['auth', 'session', 'update', 'socketOn', 'queue', 'character', 'corporation', 'alliance', 'online', 'location', 'solarSystemName', 'ship', 'shipTypeName']),
    bearer () {
      return btoa(`${process.env.CLIENT_ID}:${this.session.token}`)
    }
  },
  methods: {
    async getCharacter (id) {
      try {
        console.log('Check Character', id)
        const characterPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/?datasource=tranquility&language=en-us`)
        let character = characterPromise.data
        if (character.alliance_id > 0) {
          const corporationPromise = this.$axios(`https://esi.evetech.net/latest/corporations/${character.corporation_id}/?datasource=tranquility&language=en-us`)
          const alliancePromise = this.$axios(`https://esi.evetech.net/latest/alliances/${character.alliance_id}/?datasource=tranquility&language=en-us`)
          const [corporation, alliance] = await Promise.all([corporationPromise, alliancePromise])
          return ({ character: character, corporation: corporation.data, alliance: alliance.data })
        } else {
          const corporationPromise = await this.$axios(`https://esi.evetech.net/latest/corporations/${character.corporation_id}/?datasource=tranquility&language=en-us`)
          let corporation = corporationPromise.data
          let alliance = { id: 0, name: 'No Alliance' }
          return ({ character: character, corporation: corporation, alliance: alliance })
        }
      } catch (e) {
        console.error('Error getCharacter', e)
      }
    },
    async getName (id) {
      if (id < 100000) {
        const response = await this.$axios(`https://esi.evetech.net/latest/universe/types/${id}/?datasource=tranquility&language=en-us`)
        return ({ name: response.data.name, mass: response.data.mass })
      } else if (id < 40000000) {
        const response = await this.$axios(`https://esi.evetech.net/latest/universe/systems/${id}/?datasource=tranquility&language=en-us`)
        return response.data.name
      } else {
        const response = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/?datasource=tranquility&language=en-us`)
        return response.data.name
      }
    },
    async getOnline (id) {
      this.queue.delete('getOnline+Fleet')
      this.update = new Date()
      try {
        console.log('Check Online')
        const onlinePromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/online/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.session.token}` } })
        this.online = onlinePromise.data
        await this.getFleet(id)
      } catch (e) {
        console.error('Error getOnline', e)
      } finally {
        this.queue.set('getOnline+Fleet', setTimeout(this.getOnline, 60000, id))
        this.update = new Date()
      }
    },
    async getLocation (id) {
      this.queue.delete('getLocation')
      this.update = new Date()
      try {
        console.log('Check Location')
        const locationPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/location/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.session.token}` } })
        this.location = locationPromise.data
        const solarSystemNamePromise = await this.getName(this.location.solar_system_id)
        this.solarSystemName = solarSystemNamePromise
        // const systemPromise = await this.$axios(`https://esi.evetech.net/latest/universe/systems/${this.location.solar_system_id}/?datasource=tranquility`)
        // this.solarSystemName = systemPromise.data.name
      } catch (e) {
        console.error('Error getLocation', e)
      } finally {
        this.queue.set('getLocation', setTimeout(this.getLocation, 5000, id))
        this.update = new Date()
      }
    },
    async getShip (id) {
      this.queue.delete('getShip')
      this.update = new Date()
      try {
        console.log('Check Ship')
        const shipPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/ship/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.session.token}` } })
        this.ship = shipPromise.data
        let name = await this.getName(this.ship.ship_type_id)
        this.shipTypeName = name
        // const typePromise = await this.$axios(`https://esi.evetech.net/latest/universe/types/${this.ship.ship_type_id}/?datasource=tranquility`)
        // this.shipTypeName = typePromise.data.name
      } catch (e) {
        console.error('Error getShip', e)
      } finally {
        this.queue.set('getShip', setTimeout(this.getShip, 5000, id))
        this.update = new Date()
      }
    },
    async getFleet (id) {
      console.log('Check Fleet')
      try {
        if (this.online.online) {
          const fleetPromise = await this.$axios(`https://esi.evetech.net/dev/characters/${id}/fleet/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.session.token}` } })
          this.fleet = fleetPromise.data
          let name = await this.getName(this.fleet.fleet_boss_id)
          this.bossName = name
        } else {
          this.fleet = {}
        }
        // const bossPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${this.fleet.fleet_boss_id}/?datasource=tranquility`)
        // this.boss = bossPromise.data
      } catch (e) {
        if (e.status && e.status === 404) {
          this.$q.notify({ message: `Error ${e.status}: ${e.data.error}`, color: 'primary' })
          this.fleet = {}
        } else {
          console.error('Error getFleet', e)
        }
      }
      // setTimeout(this.getFleet, 60000, id)
    },
    async getFleetMembers (id) {
      this.queue.delete('getFleetMembers')
      this.update = new Date()
      try {
        console.log('Check Fleet Members', this.fleet.fleet_id)
        // console.log(this.fleet.fleet_id, this.fleet.fleet_boss_id, id)
        if (this.fleet.hasOwnProperty('fleet_id') && this.online.online) {
          if (this.fleet.fleet_boss_id === id) {
            this.receiveFleet = false
            this.loadingMembers = true
            const membersPromise = this.$axios(`https://esi.evetech.net/dev/fleets/${this.fleet.fleet_id}/members/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.session.token}` } })
            const wingsPromise = this.$axios(`https://esi.evetech.net/dev/fleets/${this.fleet.fleet_id}/wings/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.session.token}` } })
            const [members, wings] = await Promise.all([membersPromise, wingsPromise])
            this.members = members.data
            // console.log(this.members)
            this.putFleet = {}
            this.putFleet.members = []
            this.putFleet.fleet_id = this.fleet.fleet_id
            this.putFleet.fleet_boss_id = this.fleet.fleet_boss_id
            this.putFleet.fleet_boss_name = this.bossName
            let idName = []
            for (let wing of wings.data) {
              // console.log(wing.id, wing.name)
              idName[wing.id] = wing.name
              for (let squad of wing.squads) {
                // console.log(squad.id, squad.name)
                idName[squad.id] = squad.name
              }
            }
            for (let member of this.members) {
              // console.log(member)
              // const characterName = await this.getName(member.character_id)
              // member.character_name = characterName
              const character = await this.getCharacter(member.character_id)
              // console.log(character)
              member.character_name = character.character.name
              member.corporation_id = character.character.corporation_id
              member.corporation_name = character.corporation.name
              member.corporation_ticker = character.corporation.ticker
              member.alliance_id = character.character.alliance_id
              member.alliance_name = character.alliance.name
              const ship = await this.getName(member.ship_type_id)
              member.ship_type_name = ship.name
              member.ship_type_mass = ship.mass
              const systemName = await this.getName(member.solar_system_id)
              member.solar_system_name = systemName
              member.wing_name = idName[member.wing_id]
              member.squad_name = idName[member.squad_id]
              this.putFleet.members.push(member)
            }
            socket.emit('boss', this.putFleet)
            this.membersData = [...this.putFleet.members]
            this.refreshFilteredData()
            setTimeout(() => { this.loadingMembers = false }, 1000)
            console.log(this.putFleet)
          } else {
            this.receiveFleet = true
          }
        } else {
          // console.log('Ignore fleetMembers')
          this.receiveFleet = false
          // this.putFleet = {}
        }
      } catch (e) {
        this.loadingMembers = false
        console.error('Error getFleetMembers', e)
        if (e.status && e.status === 404) {
          this.membersData = []
          this.totalMass = 0
        }
      } finally {
        this.queue.set('getFleetMembers', setTimeout(this.getFleetMembers, 5000, id))
        this.update = new Date()
      }
    },
    async refreshToken (token) {
      try {
        console.log('Refresh Token')
        this.$q.notify({ message: 'Refresh Token', color: 'primary' })
        const tokenPromise = await this.$axios.post(`${process.env.API_PASS_URL}/refresh`, { token: token, client_ID: process.env.CLIENT_ID })
        return tokenPromise.data.token
      } catch (e) {
        console.error('Error refreshToken', e)
        throw e
      }
    },
    customSort (rows, sortBy, descending) {
      let data = [...rows]
      data.sort(firstBy('wing_id')
        .thenBy('squad_id')
        .thenBy('role')
        .thenBy('character_name'))
      return data
    },
    filterData (details) {
      if (details.added) {
        for (let key of details.keys) {
          this.selectedSet.add(key)
        }
      } else {
        for (let key of details.keys) {
          this.selectedSet.delete(key)
        }
      }
      this.refreshFilteredData()
    },
    refreshFilteredData () {
      this.filteredData = this.membersData.filter(member => !this.selectedSet.has(member.character_id))
      this.totalMass = 0
      for (let member of this.filteredData) {
        this.totalMass += member.ship_type_mass
      }
      // console.log(this.filteredData)
    },
    startQueue (id) {
      this.getOnline(id)
      this.getLocation(id)
      this.getShip(id)
      // this.getFleet(this.session.id)
      this.getFleetMembers(id)
    },
    stopQueue () {
      for (let [job, jobID] of this.queue) {
        clearTimeout(jobID)
        this.queue.delete(job)
        this.update = new Date()
      }
    },
    interceptor () {
      this.$axios.interceptors.response.use(async response => {
        return response
      }, async error => {
        const oldToken = this.session.token
        const release = await mutex.acquire()
        try {
          if (error.response) {
            if (error.response.status === 500) {
              console.log('Ignore error 500')
            } else if (error.response.status === 403 && error.response.data && (error.response.data.sso_status === 200 || error.response.data.sso_status === 401)) {
              if (this.session.token === oldToken) {
                const newToken = await this.refreshToken(this.session.token)
                if (newToken) {
                  this.session = { id: this.session.id, name: this.session.name, token: newToken }
                  this.$q.localStorage.set('session', this.session)
                  this.update = new Date()
                }
                // this.$q.notify({ message: `Error ${e.status}: ${e.data.error}`, color: 'negative' })
              }
              // this.$axios.interceptors.response.eject(this.axiosResponseInterceptor)
              error.config.headers.Authorization = `Bearer ${this.session.token}`
              return this.$axios.request(error.config)
            } else if (error.response.status === 504) {
              console.log('Error 504')
              return this.$axios.request(error.config)
            } else if (error.response.status === 404) {
              throw error.response
            } else {
              console.error('status', `${error.response.status}: ${error.response.data.error}`)
              this.$q.notify({ message: `Error ${error.response.status}: ${error.response.data.error}`, color: 'negative' })
              throw error.response
            }
          } else if (error.request) {
            console.error(error.request)
            this.$q.notify({ message: 'Error Request', color: 'negative' })
            throw error.request
          } else {
            console.error(error.message)
            this.$q.notify({ message: error.message, color: 'negative' })
            throw error.message
          }
        } catch (e) {
          console.error('Error interceptor', e)
          throw e
        } finally {
          release()
        }
      })
    }
  },
  async mounted () {
    this.$q.notify({ message: 'Bienvenue !', color: 'primary' })
  },
  watch: {
    fleet: function (newValue, oldValue) {
      if (newValue.fleet_id !== oldValue.fleet_id) {
        socket.emit('name', { name: this.session.name, fleet_id: (newValue.fleet_id ? newValue.fleet_id : 0) })
        console.log('Fleet changed', newValue.fleet_id, oldValue.fleet_id)
        if (oldValue.fleet_id > 0) socket.off(`fleet-${oldValue.fleet_id}`)
        // console.log(this.receiveFleet)
        if (newValue.fleet_id > 0) {
          console.log(`listening on fleet-${newValue.fleet_id}`)
          socket.on(`fleet-${newValue.fleet_id}`, (fleet) => {
            console.log(`Refresh fleet-${newValue.fleet_id}`)
            this.loadingMembers = true
            this.putFleet = fleet
            this.membersData = [...this.putFleet.members]
            this.refreshFilteredData()
            setTimeout(() => { this.loadingMembers = false }, 1000)
          })
        } else {
          this.membersData = []
          this.totalMass = 0
        }
      }
    }
  },
  async created () {
    if (this.$q.localStorage.has('auth')) { this.auth = this.$q.localStorage.getItem('auth') }
    if (!this.auth) {
      this.$router.push('login')
    } else {
      if (this.$q.localStorage.has('session')) {
        this.session = this.$q.localStorage.getItem('session')
        this.update = new Date()
        socket.on('connect', () => {
          this.socketOn = true
          if (this.fleet.hasOwnProperty('fleet_id')) {
            socket.emit('name', { name: this.session.name, fleet_id: this.fleet.fleet_id })
          } else {
            socket.emit('name', { name: this.session.name, fleet_id: 0 })
          }
        })
        socket.on('disconnect', () => {
          this.socketOn = false
        })
        this.interceptor()
        const characterPromise = await this.getCharacter(this.session.id)
        this.character = characterPromise.character
        this.corporation = characterPromise.corporation
        this.alliance = characterPromise.alliance
        this.startQueue(this.session.id)
      }
    }
  },
  destroyed () {
    this.stopQueue()
  }
}
</script>
