import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import { allRoutes } from 'shared/constants/AllRoutes'

const AuthLayout = React.lazy(() => import('layouts/auth-layout'))

function PublicRoute({ component: Component, ...rest }) {
  const isAuthenticated = localStorage.getItem('token')
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Redirect to={allRoutes.dashboard} /> : <AuthLayout {...props} childComponent={<Component {...props} />} />
      }
    />
  )
}

PublicRoute.propTypes = {
  component: PropTypes.elementType.isRequired
}

export default PublicRoute
