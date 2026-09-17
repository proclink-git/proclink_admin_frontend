import React, { Suspense } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import logo from 'assets/images/logo.svg'
import { allRoutes } from 'shared/constants/AllRoutes'

function AuthLayout({ childComponent }) {
  return (
    <div className="auth-main d-flex align-items-center">
      <div className="child-box">
        <Link to={allRoutes.login}>
          <img src={logo} alt="Proclink" width={200} />
        </Link>
        <Suspense
          fallback={
            <div>
              <FormattedMessage id="loading" />
              ...
            </div>
          }
        >
          {childComponent}
        </Suspense>
      </div>
    </div>
  )
}

AuthLayout.propTypes = {
  childComponent: PropTypes.node.isRequired
}

export default AuthLayout
