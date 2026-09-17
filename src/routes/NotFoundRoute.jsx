import React from 'react'

import MainLayout from 'layouts/main-layout'
import NotFound from 'views/errors/not-found'

function NotFoundRoute(props) {
  const isAuthenticated = Boolean(localStorage.getItem('token'))

  if (!isAuthenticated) {
    return <NotFound {...props} standalone />
  }

  return (
    <MainLayout>
      <NotFound {...props} />
    </MainLayout>
  )
}

export default NotFoundRoute
