// import something here
import { JSO } from 'jso'

// "async" is optional
export default async ({ app }) => {
  // something to do
  let config = {
    providerID: 'ccp',
    default_lifetime: 1200,
    debug: true,
    response_type: 'code',
    token: 'https://login.eveonline.com/oauth/token',
    client_id: 'd5147d4b224e47918b0718352f4471be',
    redirect_uri: 'http://localhost:8080/callback', // The URL where you is redirected back, and where you perform run the callback() function.
    authorization: 'https://accounts.google.com/o/oauth2/auth',
    scopes: { request: [
      'publicData',
      'esi-location.read_location.v1',
      'esi-fleets.read_fleet.v1',
      'esi-location.read_online.v1'
    ] }
  }
  app.jso = new JSO(config)
}
