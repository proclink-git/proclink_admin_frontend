import React from 'react'
import PropTypes from 'prop-types'
import { ApolloClient, ApolloProvider, createHttpLink, from, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

import { TOAST_TYPE, API_URL } from 'shared/constants'
import { appPath } from 'shared/utils/appPath'
// import { getMainDefinition } from '@apollo/client/utilities'

const httpLink = createHttpLink({
  uri: API_URL
})

function getErrorMessage(message) {
  if (!message) return 'Something went wrong'

  try {
    const error = JSON.parse(message)
    return error?.message || message
  } catch (error) {
    return message
  }
}

function isInvalidHeaderCategoryError(message, extensions) {
  return extensions?.code === 'BAD_USER_INPUT' && /HEADER_CATEGORY_TYPE|eHeaderCategoryType/.test(message || '')
}

function redirectToNotFound() {
  if (window.location.pathname.endsWith('/404')) return

  window.location.replace(appPath(`/404?from=${encodeURIComponent(window.location.pathname)}`))
}

// const splitLink =
//   typeof window === 'undefined' ? httpLink : split(
//     ({ query }) => {
//       const definition = getMainDefinition(query)
//       return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
//     },
//     httpLink
//   )

class MyApolloProvider extends React.Component {
  constructor(props) {
    super(props)
    this.middleware = setContext((_, { headers }) => {
      const token = localStorage.getItem('token')
      return {
        headers: {
          ...headers,
          authorization: token && `${token}`,
          language: 'english'
        }
      }
    })

    this.errorLink = onError(({ graphQLErrors, networkError, operation }) => {
      if (graphQLErrors && operation.operationName !== 'GetSeoBySlug' && operation.operationName !== 'GetTagById') {
        graphQLErrors.forEach(({ message, extensions }) => {
          const errorMessage = getErrorMessage(message)
          if (isInvalidHeaderCategoryError(errorMessage, extensions)) {
            redirectToNotFound()
            return
          }
          if (extensions?.code === 'UNAUTHENTICATED') {
            // unauthorized
            localStorage.clear()
            sessionStorage.clear()
            window.location.replace(appPath('/'))
          }
          // console.log(message)
          this.props.dispatch({
            type: 'SHOW_TOAST',
            payload: { message: errorMessage, type: TOAST_TYPE.Error, btnTxt: 'Close' }
          })
        })
      }
      if (networkError) console.log(`[Network error]: ${networkError}`)
    })

    this.graphqlClient = new ApolloClient({
      link: from([this.errorLink, this.middleware, httpLink]),
      defaultOptions: {
        watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'all' },
        query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
        mutate: { fetchPolicy: 'network-only', errorPolicy: 'all' }
      },
      cache: new InMemoryCache(),
      connectToDevTools: true
    })
  }

  render() {
    return <ApolloProvider client={this.graphqlClient}>{this.props.children}</ApolloProvider>
  }
}
MyApolloProvider.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  logout: PropTypes.func
}
export default MyApolloProvider
