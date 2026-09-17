import React, { useContext, useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useParams } from 'react-router'
import { FormattedMessage } from 'react-intl'
import { CHANGE_DISPLAY_AUTHOR } from 'graph-ql/article/mutation'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import Img from 'shared/components/image'
import { debounce, getS3Url } from 'shared/utils'
import { LIST_AUTHORS_WITHOUT_PERMISSION } from 'graph-ql/author/query'
import { validationErrors } from 'shared/constants/ValidationErrors'

function DisplayAuthor({ control, disabled, articleData, type, isMultiple, className, placeholder }) {
  const { id, categoryType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const [payload, setPayload] = useState({
    nLimit: 10,
    nSkip: 1,
    sSearch: '',
    eHeaderCategoryType: categoryType,
    eAuthorType: categoryType === 'b' ? 'a' : 's'
  })
  const [users, setUsers] = useState([])
  const total = useRef(0)
  const isBottomReached = useRef(false)
  const currentRecord = useRef(0)

  const {
    formState: { errors }
  } = useFormContext()

  const { loading } = useQuery(LIST_AUTHORS_WITHOUT_PERMISSION, {
    variables: { input: payload },
    onCompleted: (data) => {
      if (data?.listAuthorsFront) {
        if (isBottomReached.current) {
          currentRecord.current = users.length
          setUsers([...users, ...data.listAuthorsFront.aResults])
        } else {
          setUsers(data.listAuthorsFront.aResults)
        }
        total.current = data.listAuthorsFront.nTotal
      }
    }
  })

  const [articleAuthorChange] = useMutation(CHANGE_DISPLAY_AUTHOR, {
    onCompleted: (data) => {
      if (data?.editDisplayAuthor) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editDisplayAuthor.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const values = useWatch({
    control,
    name: 'iAuthorDId'
  })

  useEffect(() => {
    if (isBottomReached.current) {
      isBottomReached.current = false
    }
  }, [users])

  function handleChange(e) {
    if (id && articleData) {
      articleAuthorChange({ variables: { input: { iArticleId: articleData._id, iAuthorDId: e._id, eHeaderCategoryType: categoryType } } })
    }
  }

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
        name="iAuthorDId"
        control={control}
        rules={{ required: validationErrors.required }}
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
              placeholder={placeholder || 'Select...'}
              onMenuScrollToBottom={handleScroll}
              onInputChange={(e, i) => handleSearch(e, i)}
              menuIsOpen={!disabled}
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
                handleChange(e)
              }}
            />
          )
        }}
      />
      {errors?.iAuthorDId && <p className="invalid-feedback mb-0 text-start">{errors?.iAuthorDId?.message}</p>}
    </>
  )
}
DisplayAuthor.propTypes = {
  disabled: PropTypes.bool,
  isMultiple: PropTypes.bool,
  articleData: PropTypes.object,
  control: PropTypes.object,
  type: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string
}
export default DisplayAuthor
