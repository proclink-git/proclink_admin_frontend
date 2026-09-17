import React, { useEffect, useState } from 'react'
import { Redirect, Route, useLocation } from 'react-router-dom'
import { useHistory } from 'react-router'
import PropTypes from 'prop-types'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_USER_PERMISSION } from 'graph-ql/permission/query'
import Loading from 'shared/components/loading'
import { useQuery } from '@apollo/client'
import NotFound from 'views/errors/not-found'
import { isValidPrivateRouteParams } from './routeGuards'

const MainLayout = React.lazy(() => import('layouts/main-layout'))

function PrivateRoutes({ component: Component, isAllowedTo, allowedCategoryTypes, ...rest }) {
  const location = useLocation()
  const history = useHistory()
  const [permission, setPermission] = useState([])
  const isAuthenticated = localStorage.getItem('token')
  const { data } = useQuery(GET_USER_PERMISSION)
  const isArray = Array.isArray(isAllowedTo)
  useEffect(() => {
    data?.getUserPermissions && setPermission(data.getUserPermissions)
  }, [data])
  return (
    <Route
      {...rest}
      render={(routeProps) => {
        const hasInvalidRouteParams = !isValidPrivateRouteParams(routeProps.match.params, rest.path, allowedCategoryTypes)

        if (hasInvalidRouteParams) {
          if (!isAuthenticated) return <NotFound {...routeProps} standalone />

          return (
            <MainLayout {...routeProps}>
              <NotFound {...routeProps} />
            </MainLayout>
          )
        }

        if (permission.length) {
          if (!isAuthenticated) {
            return <Redirect to={{ pathname: allRoutes.login, state: { previousPath: location.pathname } }} />
          }
          if (
            (isAllowedTo && !permission.includes(isAllowedTo) && !isArray) ||
            (isArray && !permission?.find((p) => isAllowedTo?.includes(p)))
          ) {
            history.length > 2 ? history.goBack() : window.close()
          } else {
            return (
              <MainLayout {...routeProps}>
                <Component {...routeProps} userPermission={permission} />
              </MainLayout>
            )
          }
        } else if (!permission.length && !isAuthenticated) {
          return <Redirect to={{ pathname: allRoutes.login, state: { previousPath: location.pathname } }} />
        } else {
          return (
            <MainLayout {...routeProps}>
              <Loading {...routeProps} />
            </MainLayout>
          )
        }
      }}
    />
  )
}

PrivateRoutes.propTypes = {
  component: PropTypes.elementType.isRequired,
  allowedCategoryTypes: PropTypes.array,
  isAllowedTo: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ])
}

export default PrivateRoutes
