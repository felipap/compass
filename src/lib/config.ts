/* eslint-disable no-console */

import { app } from 'electron'

// FELIPE: found it made more sense to opt-OUT of verbose.
export const VERBOSE = process.env.QUIET !== 'true'

// If the user is nudged twice in this time, we won't show a notification.
export const DOUBLE_NUDGE_THRESHOLD_MINS = 5

export const GITHUB_DISCUSSIONS_URL =
  'https://github.com/felipap/compass/discussions'

// Check for updates after this time of startup. Just because if the user open
// the app and goes straight to the "Check for updates..." button, the behavior
// is a little confusing if the app is already trying to update itself.
export const CHECK_UPDATE_AFTER_MS = 2 * 60 * 1000

console.log('VERBOSE', VERBOSE)
console.log('app.isPackaged', app.isPackaged)
