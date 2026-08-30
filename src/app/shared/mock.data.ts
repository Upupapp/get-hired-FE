export const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Shared year range for every "Select Year" dropdown (work experience,
// education, awards). Previously each component hardcoded its own
// `new Array(30).fill(0).map((el, i) => 1995 + i)`, which only ever
// covered 1995-2024 and went stale as soon as the calendar passed 2024.
// Computed from the current year so it never goes stale again, starting
// from 1901 (oldest plausible year a jobseeker would need to select).
const YEAR_RANGE_START = 1901;
export const years: number[] = new Array(new Date().getFullYear() - YEAR_RANGE_START + 1)
  .fill(0)
  .map((_, i) => YEAR_RANGE_START + i);

export const currencies = [
    {
        name: 'PHP',
    },
    {
        name: 'USD',
    },
    {
        name: 'VND',
    }
];
