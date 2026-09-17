import React, { useState, useEffect } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import Drawer from '../drawer'
import { LOGOUT } from 'graph-ql/auth/Logout'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_CURRENT_USER } from 'graph-ql/profile/query'
import ChangePassword from '../change-password'
import { getS3Url, setCurrentUser } from 'shared/utils'
import { GlobalEventsContext } from '../global-events'

function Header() {
  const [user, setUser] = useState()
  const [isChangePassOpen, setIsChangePassOpen] = useState(false)
  const [isDropDown, setIsDropDown] = useState(false)

  const client = useApolloClient()
  const history = useHistory()
  const {
    state: { profileData }
  } = React.useContext(GlobalEventsContext)

  useQuery(GET_CURRENT_USER, {
    onCompleted: (data) => {
      if (data && data.getProfile) {
        setUser(data.getProfile)
        setCurrentUser(data.getProfile)
      }
    }
  })

  useEffect(() => {
    profileData && setUser({ ...user, ...profileData })
  }, [profileData])

  const [logout] = useMutation(LOGOUT, {
    onCompleted: (data) => {
      if (data && data.adminLogout) {
        localStorage.clear()
        history.push(allRoutes.login)
        client.resetStore()
      }
    }
  })

  function handleLogout() {
    logout()
  }

  function handleEditProfile() {
    history.push(allRoutes.editProfile)
  }

  function handleChangePass() {
    setIsChangePassOpen(!isChangePassOpen)
  }

  return (
    <header className="header d-flex align-items-center justify-content-between">
      <div className="header-left">
        <Dropdown show={isDropDown} onMouseEnter={() => setIsDropDown(true)} onMouseLeave={() => setIsDropDown(false)}>
          <Dropdown.Toggle variant="link" className="square p-0 d-flex align-items-center">
            <div className="img d-flex align-items-center justify-content-center">
              {user?.sUrl ? (
                <img src={getS3Url(user?.sUrl)} className="h-100 w-100 cover" alt={user?.sDisplayName} />
              ) : (
                <i className="icon-account"></i>
              )}
            </div>
            {user && user.sFName}
          </Dropdown.Toggle>
          <Dropdown.Menu className="up-arrow">
            <Dropdown.Item onClick={handleEditProfile}>
              <i className="icon-account"></i>
              <FormattedMessage id="myProfile" />
            </Dropdown.Item>
            <Dropdown.Item onClick={handleChangePass}>
              <i className="icon-lock"></i>
              <FormattedMessage id="changePassword" />
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>
              <i className="icon-logout"></i>
              <FormattedMessage id="logout" />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {/* <div className="header-right">
        <Button className="icon-r square" variant="light">
          <i className="icon-notifications"></i>
        </Button>
      </div> */}
      <Drawer
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(!isChangePassOpen)}
        title={useIntl().formatMessage({ id: 'changePassword' })}
      >
        <ChangePassword handleChangePass={handleChangePass} />
      </Drawer>
    </header>
  )
}

export default Header
