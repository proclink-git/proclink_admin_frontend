import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import Logo from 'assets/images/logo.svg'
import LogoIcon from 'assets/images/logo-icon.svg'
import { Button } from 'react-bootstrap'
import { sidebarConfig } from './SidebarConfig'
import MenuItem from './MenuItem'
import { allRoutes } from 'shared/constants/AllRoutes'
import PermissionProvider from '../permission-provider'
import { useApolloClient } from '@apollo/client'
import { GET_USER_PERMISSION } from 'graph-ql/permission/query'

function SideBar() {
  const client = useApolloClient()
  const data = client.readQuery({
    query: GET_USER_PERMISSION
  })
  const [isOpen, setIsOpen] = useState(!!localStorage.getItem('isSidebarOpen'))

  function handleSidebarToggle() {
    setIsOpen(!isOpen)
    if (isOpen) localStorage.removeItem('isSidebarOpen')
    else localStorage.setItem('isSidebarOpen', true)
  }
  return (
    <div className={`side-bar d-flex flex-column ${isOpen ? 'expanded' : 'collapsed'}`}>
      <div className="logo d-flex align-items-center">
        <Link to={allRoutes.dashboard} className="brand-link" aria-label="Go to dashboard">
          <img src={LogoIcon} alt={isOpen ? '' : 'Proclink'} className="brand-logo-icon" />
          {isOpen && <img src={Logo} alt="Proclink" className="brand-logo-wordmark" />}
        </Link>
      </div>
      <div className="menu">
        <ul className="p-0 m-0">
          {sidebarConfig(data?.getUserPermissions).map((item, i) => {
            if (item.isAllowedTo) {
              return (
                <PermissionProvider isArray={item.isArray} key={item.path} isAllowedTo={item.isAllowedTo}>
                  <MenuItem item={item} isMenuOpen={isOpen} />
                </PermissionProvider>
              )
            } else {
              return <MenuItem key={item.path + i} item={item} isMenuOpen={isOpen} />
            }
          })}
        </ul>
      </div>
      <Button
        onClick={handleSidebarToggle}
        variant="link"
        className="open-btn square lh-1 p-1 mt-auto"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <i className="icon-sidebar"></i>
      </Button>
    </div>
  )
}

export default SideBar
