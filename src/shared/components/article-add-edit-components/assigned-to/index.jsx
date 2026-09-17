import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router'

import Img from 'shared/components/image'
import { debounce, getS3Url } from 'shared/utils'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { LIST_PERMITTED_SUB_ADMIN } from 'graph-ql/article/query'

function AssignedTo({ control, disabled, articleData, type, isMultiple, className, placeholder }) {
  const { categoryType, id } = useParams()
  const [payload, setPayload] = useState({
    nLimit: 10,
    nSkip: 1,
    sSearch: '',
    eHeaderCategoryType: categoryType
  })
  const [users, setUsers] = useState([])
  const total = useRef(0)
  const isBottomReached = useRef(false)
  const currentRecord = useRef(0)

  const {
    formState: { errors }
  } = useFormContext()

  const { loading } = useQuery(LIST_PERMITTED_SUB_ADMIN, {
    variables: { input: payload },
    onCompleted: (data) => {
      if (data?.listPermittedSubAdmins) {
        if (isBottomReached.current) {
          currentRecord.current = users.length
          setUsers([...users, ...data.listPermittedSubAdmins.aResults])
        } else {
          setUsers(data.listPermittedSubAdmins.aResults)
        }
        total.current = data.listPermittedSubAdmins.nTotal
      }
    }
  })

  const values = useWatch({
    control,
    name: 'iAssignedTo'
  })
  const selectPlaceholder = placeholder || (id ? 'Select...' : 'Select...')
  const emptyUsersMessage = typeof validationErrors?.required === 'string' ? 'No matching users found' : 'No matching users found'

  useEffect(() => {
    if (isBottomReached.current) {
      isBottomReached.current = false
    }
  }, [users])

  function handleScroll() {
    if (users.length < total.current) {
      isBottomReached.current = true
      setPayload({ ...payload, nSkip: payload.nSkip + 1 })
    }
  }

  const handleSearch = debounce((sSearch, { action }) => {
    if (action === 'input-change') {
      setPayload({ ...payload, nSkip: 1, sSearch })
    }
  })
  return (
    <>
      <Controller
        name="iAssignedTo"
        control={control}
        render={({ field: { onChange, value = [] } }) => {
          return (
            <Select
              isLoading={loading}
              value={value || values}
              isMulti={isMultiple}
              options={users}
              getOptionLabel={(option) => option.sFName || option.sDisplayName}
              getOptionValue={(option) => {
                return option._id || option.id
              }}
              className={`react-select display-author on-hover arrow ${className || ''}`}
              classNamePrefix="select"
              isSearchable={true}
              isDisabled={disabled}
              placeholder={selectPlaceholder}
              onMenuScrollToBottom={handleScroll}
              onInputChange={(e, i) => handleSearch(e, i)}
              menuIsOpen={!disabled}
              noOptionsMessage={() => emptyUsersMessage}
              formatOptionLabel={(user) => (
                <div className="country-option">
                  {user.sUrl ? (
                    <Img src={getS3Url(user.sUrl)} className="authorImg" alt={user.sFName} />
                  ) : (
                    <i className="icon-account-fill no-img" />
                  )}
                  <span>{user.sFName}</span>
                </div>
              )}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )
        }}
      />
      {errors?.iAssignedTo && <p className="invalid-feedback mb-0 text-start">{errors?.iAssignedTo?.message}</p>}
    </>
  )
}
AssignedTo.propTypes = {
  disabled: PropTypes.bool,
  isMultiple: PropTypes.bool,
  articleData: PropTypes.object,
  control: PropTypes.object,
  type: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string
}
export default AssignedTo
