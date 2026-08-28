// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  projectName: 'gethired',
  server: 'http://localhost:3000',
  main_product_id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzcxNTE3OTU2MzQzNDk=',
  // Local dev: pointed at the local backend (see get-hired-BE/docker-compose.yml
  // + .env). Swap the two lines below to point back at the live API.
  api_url: 'http://localhost:3000/api',
  //api_url: 'https://api-dot-get-hired-363107.et.r.appspot.com/api',
  app_url: 'http://localhost:4200',
  NgRxName: 'App devtools',
  NgRxMaxAge: 15,
  isDebug: true,
  mapRestrictions: ['sg', 'ph'],
  apiKey: 'AIzaSyB6zvOfgenO-ed_KkyjYus1PcSk5aiMo4A',
  recaptchaSiteKey: "6LesdZ0tAAAAANTArmxFxI6tKsqUPiMn24LAEqui",
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
