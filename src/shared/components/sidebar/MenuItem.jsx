import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import PermissionProvider from '../permission-provider'

const DESKTOP_SIDEBAR_BREAKPOINT = 992
const DESKTOP_SUBMENU_CLOSE_DELAY = 180

function MenuItem({ item, isMenuOpen }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmenuVisible, setIsSubmenuVisible] = useState(false)
  const [desktopSubmenuStyle, setDesktopSubmenuStyle] = useState({})
  const childPaths = item.children && item.children.map((i) => i.path.split('/')[1])
  const location = useLocation()
  const menuItemRef = useRef(null)
  const submenuRef = useRef(null)
  const closeTimeoutRef = useRef(null)

  function isDesktopViewport() {
    return typeof window !== 'undefined' && window.innerWidth >= DESKTOP_SIDEBAR_BREAKPOINT
  }

  function clearCloseTimeout() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  function updateDesktopSubmenuPosition() {
    if (!isMenuOpen || !item.children || !isDesktopViewport() || !menuItemRef.current) {
      setDesktopSubmenuStyle({})
      return
    }

    const menuItemRect = menuItemRef.current.getBoundingClientRect()
    const submenuHeight = submenuRef.current?.offsetHeight || 0
    const viewportPadding = 12
    const preferredTop = menuItemRect.top - 10
    const maxTop = Math.max(viewportPadding, window.innerHeight - submenuHeight - viewportPadding)
    const top = submenuHeight ? Math.min(Math.max(viewportPadding, preferredTop), maxTop) : Math.max(viewportPadding, preferredTop)

    setDesktopSubmenuStyle({
      top: `${Math.round(top)}px`,
      left: `${Math.round(menuItemRect.right + 16)}px`
    })
  }

  function showDesktopSubmenu() {
    if (!item.children || !isMenuOpen || !isDesktopViewport()) return

    clearCloseTimeout()
    updateDesktopSubmenuPosition()
    setIsSubmenuVisible(true)
  }

  function handleDesktopMouseEnter() {
    showDesktopSubmenu()
  }

  function handleDesktopMouseLeave() {
    if (!isDesktopViewport()) return

    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      setIsSubmenuVisible(false)
    }, DESKTOP_SUBMENU_CLOSE_DELAY)
  }

  function handleToggleSubmenu() {
    if (isDesktopViewport()) return

    setIsOpen((currentState) => !currentState)
  }

  useEffect(() => {
    if (!isMenuOpen) {
      clearCloseTimeout()
      setIsOpen(false)
      setIsSubmenuVisible(false)
      setDesktopSubmenuStyle({})
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!item.children || !isMenuOpen || (!isSubmenuVisible && !isOpen) || !isDesktopViewport()) return

    updateDesktopSubmenuPosition()

    const scrollContainer = menuItemRef.current?.closest('.menu')
    const handlePositionUpdate = () => updateDesktopSubmenuPosition()

    window.addEventListener('resize', handlePositionUpdate)
    scrollContainer?.addEventListener('scroll', handlePositionUpdate)

    return () => {
      window.removeEventListener('resize', handlePositionUpdate)
      scrollContainer?.removeEventListener('scroll', handlePositionUpdate)
    }
  }, [isMenuOpen, isOpen, isSubmenuVisible, item.children])

  useEffect(() => () => clearCloseTimeout(), [])

  const itemClassName = [isOpen ? 'open' : '', isSubmenuVisible ? 'submenu-visible' : ''].filter(Boolean).join(' ')

  return (
    <li ref={menuItemRef} className={itemClassName} onMouseEnter={handleDesktopMouseEnter} onMouseLeave={handleDesktopMouseLeave}>
      <NavLink to={item.path} activeClassName="active" className={childPaths?.includes(location.pathname.split('/')[1]) ? 'active' : ''}>
        <i className={item.icon}></i>
        {isMenuOpen && item.title}
      </NavLink>
      {item.children && (
        <>
          {isMenuOpen && <i onClick={handleToggleSubmenu} className="icon-arrow-drop-down drop-icon"></i>}
          <ul
            ref={submenuRef}
            style={desktopSubmenuStyle}
            className="left-arrow dropdown-menu show big"
            onMouseEnter={handleDesktopMouseEnter}
            onMouseLeave={handleDesktopMouseLeave}
          >
            {item.children.map((subItem) => {
              if (subItem?.isArray ? subItem.isAllowedTo.length : subItem.isAllowedTo) {
                return (
                  <PermissionProvider key={subItem.path} isArray={subItem?.isArray} isAllowedTo={subItem.isAllowedTo}>
                    <li>
                      <NavLink
                        to={subItem.path}
                        exact={subItem.exact}
                        className={subItem.path === location?.pathname ? 'active pe-none' : ''}
                      >
                        {subItem.title}
                      </NavLink>
                    </li>
                  </PermissionProvider>
                )
              } else {
                return (
                  <li key={subItem.path}>
                    <NavLink
                      to={subItem.path}
                      exact={subItem.exact}
                      className={subItem.path === location?.pathname ? 'active pe-none' : ''}
                      activeClassName="not-active"
                    >
                      {subItem.title}
                    </NavLink>
                  </li>
                )
              }
            })}
          </ul>
        </>
      )}
    </li>
  )
}
MenuItem.propTypes = {
  item: PropTypes.object,
  isMenuOpen: PropTypes.bool
}
export default MenuItem
