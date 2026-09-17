import React, { Suspense } from 'react'
import PropTypes from 'prop-types'

import Header from 'shared/components/header'
import SideBar from 'shared/components/sidebar'
import Breadcrumbs from 'shared/components/breadcrumb'
import Loading from 'shared/components/loading'

function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <SideBar />
      <div className="main-container flex-grow-1">
        <Header />
        <div className="container">
          <Breadcrumbs />
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </div>
      </div>
    </div>
  )
}
MainLayout.propTypes = {
  children: PropTypes.node.isRequired
}
export default MainLayout
