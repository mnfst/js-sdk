import CaseClient from './CaseClient'

import fetch from 'node-fetch'

// Polyfill fetch() in the Node.js environment.
if (!globalThis.fetch) {
  globalThis.fetch = fetch as any
}

export default CaseClient
