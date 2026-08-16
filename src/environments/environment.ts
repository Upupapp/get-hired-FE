// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  projectName: 'gethired',
  server: 'http://localhost:3000',
  main_product_id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzcxNTE3OTU2MzQzNDk=',
  //api_url: 'https://api-dot-get-hired-363107.et.r.appspot.com/api',
  api_url: 'http://localhost:3000/api',
  // STITCH fix: was 'http://localhost:4200' -- that's the job-seeker app's
  // port, not this app's own. This app's dev port is now explicitly set
  // to 4201 in angular.json's serve.options (previously undocumented/ad hoc).
  app_url: 'http://localhost:4201',
  // Cross-app link target for "I'm looking for a job" / job-seeker-directed
  // CTAs on this standalone employer app. Placeholder until the job-seeker
  // app's real domain is decided/deployed -- update before shipping.
  jobSeekerAppUrl: 'http://localhost:4200',
  // GetHired Gateway -- the standalone "choose your path" chooser page
  // (gateway-landing/, at this repo's root) that sits in front of both
  // apps. Used by the Back/Main-Page nav on every public page (landing,
  // signin, signup).
  gatewayUrl: 'http://localhost:4000',
  NgRxName: 'App devtools',
  NgRxMaxAge: 15,
  isDebug: true,
  mapRestrictions: ['sg', 'ph'],
  apiKey: 'AIzaSyB6zvOfgenO-ed_KkyjYus1PcSk5aiMo4A',
  recaptchaSiteKey: "6LdO9FYmAAAAADJsvwivUIbrsh-onjVZhIlFJ23U",
  firebase: {
    apiKey: 'AIzaSyCn8PyF2eW2sMNsRuzCaOLusCdRcAVpkPY',
    authDomain: 'get-hired-363107.firebaseapp.com',
    projectId: 'get-hired-363107',
    storageBucket: 'get-hired-363107.appspot.com',
    messagingSenderId: "818317489154",
    appId: "1:818317489154:web:d849afade1105af929631b",
    measurementId: "G-4C797NXLJF",
  },
  // Google OAuth web client ID â€” from Firebase Console â†’ Authentication â†’ Sign-in method â†’ Google â†’ Web client ID
  googleClientId: '818317489154-iikcv1s2gno5ubsuvcoosetbpi9b0a6d.apps.googleusercontent.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
