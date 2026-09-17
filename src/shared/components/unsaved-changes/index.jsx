import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

const UnsavedChangesContext = createContext({
  registerUnsavedChanges: () => () => {},
  allowNextNavigation: () => {},
  clearUnsavedChanges: () => {}
})

const LEAVE_PAGE_TITLE = 'Leave this page?'
const LEAVE_PAGE_MESSAGE = 'You have unsaved changes. If you leave now, your changes will be lost.'

function getLocationUrl(location = {}) {
  return `${location.pathname || ''}${location.search || ''}${location.hash || ''}`
}

function getNavigationLocation(location = {}) {
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state
  }
}

function getLocationKey(location = {}) {
  return location?.key || getLocationUrl(location)
}

export function UnsavedChangesProvider({ children }) {
  const history = useHistory()
  const entriesRef = useRef(new Map())
  const unblockRef = useRef(null)
  const pendingNavigationRef = useRef(null)
  const allowNextNavigationRef = useRef(false)
  const locationStackRef = useRef([getLocationKey(history.location)])
  const currentLocationIndexRef = useRef(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const syncUnsavedState = useCallback(() => {
    setHasUnsavedChanges(Array.from(entriesRef.current.values()).some(Boolean))
  }, [])

  const registerUnsavedChanges = useCallback(
    (id, active) => {
      entriesRef.current.set(id, Boolean(active))
      syncUnsavedState()

      return () => {
        entriesRef.current.delete(id)
        syncUnsavedState()
      }
    },
    [syncUnsavedState]
  )

  const allowNextNavigation = useCallback(() => {
    allowNextNavigationRef.current = true
  }, [])

  const clearUnsavedChanges = useCallback(() => {
    entriesRef.current.clear()
    setHasUnsavedChanges(false)
  }, [])

  const getPopNavigationDelta = useCallback((nextLocation) => {
    const nextLocationIndex = locationStackRef.current.indexOf(getLocationKey(nextLocation))
    if (nextLocationIndex === -1) return 0

    return nextLocationIndex - currentLocationIndexRef.current
  }, [])

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined

    function handleBeforeUnload(event) {
      event.preventDefault()
      event.returnValue = LEAVE_PAGE_MESSAGE
      return LEAVE_PAGE_MESSAGE
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  useEffect(() => {
    return history.listen((location, action) => {
      const locationKey = getLocationKey(location)

      if (action === 'PUSH') {
        const nextStack = locationStackRef.current.slice(0, currentLocationIndexRef.current + 1)
        nextStack.push(locationKey)
        locationStackRef.current = nextStack
        currentLocationIndexRef.current = nextStack.length - 1
        return
      }

      if (action === 'REPLACE') {
        locationStackRef.current[currentLocationIndexRef.current] = locationKey
        return
      }

      const nextLocationIndex = locationStackRef.current.indexOf(locationKey)
      if (nextLocationIndex !== -1) {
        currentLocationIndexRef.current = nextLocationIndex
        return
      }

      locationStackRef.current.push(locationKey)
      currentLocationIndexRef.current = locationStackRef.current.length - 1
    })
  }, [history])

  useEffect(() => {
    if (unblockRef.current) {
      unblockRef.current()
      unblockRef.current = null
    }

    if (!hasUnsavedChanges) return undefined

    unblockRef.current = history.block((nextLocation, action) => {
      if (allowNextNavigationRef.current) {
        allowNextNavigationRef.current = false
        return true
      }

      if (getLocationUrl(history.location) === getLocationUrl(nextLocation)) return true

      pendingNavigationRef.current = {
        action,
        delta: action === 'POP' ? getPopNavigationDelta(nextLocation) : 0,
        location: nextLocation
      }
      setShowConfirmModal(true)
      return false
    })

    return () => {
      if (unblockRef.current) {
        unblockRef.current()
        unblockRef.current = null
      }
    }
  }, [hasUnsavedChanges, history])

  function handleStayOnPage() {
    pendingNavigationRef.current = null
    setShowConfirmModal(false)
  }

  function handleLeavePage() {
    const pendingNavigation = pendingNavigationRef.current
    pendingNavigationRef.current = null
    setShowConfirmModal(false)
    clearUnsavedChanges()

    if (unblockRef.current) {
      unblockRef.current()
      unblockRef.current = null
    }

    if (!pendingNavigation?.location) return

    const nextLocation = getNavigationLocation(pendingNavigation.location)
    if (pendingNavigation.action === 'REPLACE') {
      history.replace(nextLocation)
      return
    }

    if (pendingNavigation.action === 'POP' && pendingNavigation.delta) {
      history.go(pendingNavigation.delta)
      return
    }

    history.push(nextLocation)
  }

  const contextValue = useMemo(
    () => ({
      registerUnsavedChanges,
      allowNextNavigation,
      clearUnsavedChanges
    }),
    [allowNextNavigation, clearUnsavedChanges, registerUnsavedChanges]
  )

  return (
    <UnsavedChangesContext.Provider value={contextValue}>
      {children}
      <Modal show={showConfirmModal} onHide={handleStayOnPage} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>{LEAVE_PAGE_TITLE}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{LEAVE_PAGE_MESSAGE}</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleStayOnPage}>
            Stay here
          </Button>
          <Button variant="primary" onClick={handleLeavePage}>
            Leave page
          </Button>
        </Modal.Footer>
      </Modal>
    </UnsavedChangesContext.Provider>
  )
}

UnsavedChangesProvider.propTypes = {
  children: PropTypes.node
}

let unsavedChangesPromptId = 0

export function useUnsavedChangesPrompt(active) {
  const { registerUnsavedChanges } = useContext(UnsavedChangesContext)
  const idRef = useRef()

  if (!idRef.current) {
    unsavedChangesPromptId += 1
    idRef.current = `unsaved-changes-${unsavedChangesPromptId}`
  }

  useEffect(() => registerUnsavedChanges(idRef.current, active), [active, registerUnsavedChanges])
}

export function useAllowUnsavedChangesNavigation() {
  const { allowNextNavigation } = useContext(UnsavedChangesContext)
  return allowNextNavigation
}

export function useClearUnsavedChanges() {
  const { clearUnsavedChanges } = useContext(UnsavedChangesContext)
  return clearUnsavedChanges
}

export function useMarkFormClean() {
  const clearUnsavedChanges = useClearUnsavedChanges()

  return useCallback(
    (reset, getValues) => {
      if (typeof reset === 'function' && typeof getValues === 'function') {
        reset(getValues(), { keepValues: true })
      }
      clearUnsavedChanges()
    },
    [clearUnsavedChanges]
  )
}

export function FormUnsavedChangesPrompt({ disabled = false }) {
  const {
    formState: { isDirty }
  } = useFormContext()
  useUnsavedChangesPrompt(isDirty && !disabled)

  return null
}

FormUnsavedChangesPrompt.propTypes = {
  disabled: PropTypes.bool
}
