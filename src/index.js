import React from 'react'
import ReactDOM from 'react-dom'

import MyApolloProvider from 'graph-ql'
import { IntlProvider } from 'react-intl'

import App from 'App'
// import reportWebVitals from 'reportWebVitals'
import 'bootstrap/scss/bootstrap.scss'
import 'assets/scss/main.scss'
import en from './lang/en.json'

import { ToastrContext, ToastrReducers } from 'shared/components/toastr'
// import useSentry from 'shared/hooks/useSentry'

console.log('React version', React.version)

function Index() {
  // const { initSentry } = useSentry()
  // initSentry()
  const [state, dispatch] = React.useReducer(ToastrReducers, {})

  return (
    <React.StrictMode>
      <IntlProvider messages={en} locale="en" defaultLocale="en">
        <ToastrContext.Provider
          value={{
            state,
            dispatch
          }}
        >
          <MyApolloProvider dispatch={dispatch}>
            <App />
          </MyApolloProvider>
        </ToastrContext.Provider>
      </IntlProvider>
    </React.StrictMode>
  )
}

ReactDOM.render(<Index />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
