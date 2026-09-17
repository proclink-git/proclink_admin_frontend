import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Router from 'routes/Router'

const PublicRoute = React.lazy(() => import('routes/PublicRoutes'))
const PrivateRoutes = React.lazy(() => import('routes/PrivateRoutes'))
const NotFoundRoute = React.lazy(() => import('routes/NotFoundRoute'))

function Routes() {
  return (
    <Switch>
      {Router.map((route) => {
        return route.children.map((child, i) => {
          if (route.isRequiredLoggedIn) {
            return (
              <PrivateRoutes key={`r${i}`} isAllowedTo={child.isAllowedTo} path={child.path} exact={child.exact} component={child.component} {...child} />
            )
          } else {
            return <PublicRoute key={`r${i}`} path={child.path} exact={child.exact} component={child.component} />
          }
        })
      })}
      <Route component={NotFoundRoute} />
    </Switch>
  )
}
export default React.memo(Routes)
