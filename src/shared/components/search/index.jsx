import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import { parseParams } from 'shared/utils'
import { useHistory } from 'react-router'

function Search({ size, searchEvent, className, disabled }) {
  const refEdit = useRef(null)
  const history = useHistory()
  const [timer, setTimer] = useState(null)
  const params = parseParams(location.search)
  function handleChange(e) {
    if (timer) {
      clearTimeout(timer)
      setTimer(null)
    }
    setTimer(
      setTimeout(() => {
        searchEvent(e.target.value)
      }, 500)
    )
  }

  useEffect(() => {
    if (params?.sSearch === '' || !params?.sSearch) {
      refEdit.current.value = ''
    }
  }, [params?.sSearch])

  useEffect(() => {
    return history.listen((e) => {
      const newParams = parseParams(e.search)
      if (refEdit.current) {
        if (newParams.sSearch) refEdit.current.value = newParams.sSearch
        else refEdit.current.value = ' '
      }
    })
  }, [history])
  return (
    <Form.Group className={`form-group ${className}`}>
      <Form.Control
        type="search"
        placeholder={useIntl().formatMessage({ id: 'search' }) + '...'}
        size={size || 'sm'}
        onChange={handleChange}
        defaultValue={params.sSearch || ''}
        ref={refEdit}
        disabled={disabled}
      />
    </Form.Group>
  )
}
Search.propTypes = {
  size: PropTypes.string,
  className: PropTypes.string,
  searchEvent: PropTypes.func,
  disabled: PropTypes.bool
}
export default Search
