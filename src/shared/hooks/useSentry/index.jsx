import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import { APP_ENV } from 'shared/constants'

const useSentry = () => {
  function initSentry() {
    if (APP_ENV === 'production') {
      Sentry.init({
        dsn: 'https://194f78a62e76431f88ba7ee914593fb5@o1394242.ingest.sentry.io/6718569',
        environment: APP_ENV,
        integrations: [new BrowserTracing()],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0
      })
    } else {
      console.log(`Oops, Sentry is not available on ${APP_ENV} server.`)
    }
  }

  return {
    initSentry
  }
}

export default useSentry
