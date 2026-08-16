/**
 * GetHired Gateway — single source of truth for the two portal
 * destinations, mirroring the environment.ts centralization pattern
 * already used in both Angular apps (employerAppUrl / jobSeekerAppUrl).
 * This is the ONLY place these URLs are defined; index.html and app.js
 * both read from here. Update these two lines when deploying — nothing
 * else in this project needs to change.
 */
window.GETHIRED_PORTALS = {
  jobSeeker: {
    url: 'http://localhost:4200',
    signin: 'http://localhost:4200/signin',
  },
  employer: {
    url: 'http://localhost:4201',
    signin: 'http://localhost:4201/signin',
  },
};
