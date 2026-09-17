import React from 'react'
import { Nav, Tab } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useHistory, useLocation } from 'react-router-dom'

import FooterMenuForm from 'shared/components/arrange-menu-form/footer-menu-form'
import HeaderMenuForm from 'shared/components/arrange-menu-form/header-menu-form'
import SidebarMenuForm from 'shared/components/arrange-menu-form/sidebar-menu-form'
import { allRoutes } from 'shared/constants/AllRoutes'

const ArrangeMenu = () => {
  const location = useLocation()
  const history = useHistory()
  const tab = location?.state?.tab

  const handleTabs = () => {
    if (!tab) {
      return <HeaderMenuForm />
    } else if (tab === 'sidebar') {
      return <SidebarMenuForm />
    } else if (tab === 'footer') {
      return <FooterMenuForm />
    }
  }

  return (
    <>
      <Tab.Container>
        <Nav variant="tabs" className="common-tabs">
          <Nav.Item>
            <Nav.Link active={!tab} onClick={() => history.push({ pathname: allRoutes.arrangeMenu })}>
              <FormattedMessage id="headerMenu" />
            </Nav.Link>
          </Nav.Item>
          {/* <Nav.Item>
            <Nav.Link
              active={tab === 'sidebar'}
              onClick={() => history.push({ pathname: allRoutes.arrangeMenu, search: '?tab=sidebar', state: { tab: 'sidebar' } })}
            >
              <FormattedMessage id="sidebarMenu" />
            </Nav.Link>
          </Nav.Item> */}
          <Nav.Item>
            <Nav.Link
              active={tab === 'footer'}
              onClick={() => history.push({ pathname: allRoutes.arrangeMenu, search: '?tab=footer', state: { tab: 'footer' } })}
            >
              <FormattedMessage id="footerMenu" />
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>{handleTabs()}</Tab.Content>
      </Tab.Container>
    </>
  )
}

export default ArrangeMenu
