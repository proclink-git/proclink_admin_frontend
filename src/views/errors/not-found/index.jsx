import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { Link, useHistory, useLocation } from 'react-router-dom'

import { allRoutes } from 'shared/constants/AllRoutes'

function NotFound({ standalone, title, description, statusCode }) {
  const history = useHistory()
  const location = useLocation()
  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const requestedPath = new URLSearchParams(location.search).get('from') || location.pathname
  const primaryRoute = isAuthenticated ? allRoutes.dashboard : allRoutes.login
  const primaryLabel = isAuthenticated ? 'Dashboard' : 'Login'
  const canGoBack = window.history.length > 1

  return (
    <section className={`error-page${standalone ? ' error-page--standalone' : ''}`}>
      <div className="error-page__panel">
        <div className="error-page__visual" aria-hidden="true">
          <span className="error-page__code">{statusCode}</span>
          <span className="error-page__marker">
            <i className="icon-info" />
          </span>
        </div>

        <div className="error-page__content">
          <span className="error-page__eyebrow">Route unavailable</span>
          <h1>{title}</h1>
          <p>{description}</p>

          {requestedPath && (
            <div className="error-page__path">
              <span>Requested path</span>
              <code>{requestedPath}</code>
            </div>
          )}

          <div className="error-page__actions">
            <Button as={Link} to={primaryRoute} variant="primary" className="left-icon">
              <i className="icon-home" />
              {primaryLabel}
            </Button>
            {canGoBack && (
              <Button variant="outline-secondary" className="left-icon" onClick={() => history.goBack()}>
                <i className="icon-chevron-left" />
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

NotFound.defaultProps = {
  standalone: false,
  statusCode: '404',
  title: 'Page not found',
  description: 'The page you are trying to open is not available or the route data is no longer valid.'
}

NotFound.propTypes = {
  standalone: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  statusCode: PropTypes.string
}

export default NotFound
