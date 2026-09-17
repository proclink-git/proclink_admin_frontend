import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useLazyQuery } from '@apollo/client'

import { URL_PREFIX, CUSTOM_URL_WITH_SLASH, TOAST_TYPE } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { GENERATE_SLUG } from 'graph-ql/generate-slug/query'
import { ToastrContext } from 'shared/components/toastr'

function normalizePath(value = '') {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\/[^/]+\//i, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

function normalizeSlugValue(value = '', categoryURL = '') {
  let nextValue = normalizePath(value)
  const normalizedCategory = normalizePath(categoryURL)
  const categorySegment = normalizedCategory.split('/').filter(Boolean).pop()

  if (normalizedCategory) {
    while (nextValue.startsWith(normalizedCategory)) {
      nextValue = nextValue.slice(normalizedCategory.length).replace(/^\/+/, '')
    }
  }

  if (categorySegment && nextValue.startsWith(`${categorySegment}/s/`)) {
    nextValue = nextValue.slice(`${categorySegment}/s/`.length)
  }

  return nextValue
}

function prefixSlugValue(value = '', categoryURL = '') {
  const normalizedCategory = normalizePath(categoryURL)
  const slugValue = normalizeSlugValue(value, categoryURL)

  if (!normalizedCategory) return slugValue
  if (!slugValue) return normalizedCategory

  return `${normalizedCategory}/${slugValue}`
}

function Permalink({
  register,
  errors,
  values,
  setValue,
  setError,
  clearErrors,
  unregister,
  sTitle,
  categoryURL,
  slugType,
  defaultSlug,
  disabled,
  falsySlug
}) {
  const [isEditOpen, setIsOpen] = useState(false)
  const [availableSlug, setAvailableSlug] = useState()
  const [slug, updateSlug] = useState()
  const { dispatch } = useContext(ToastrContext)
  // const slugValue = useRef()
  const [sValue, setsValue] = useState()
  const checkSlugDone = useRef(false)
  const [generateSlugs] = useLazyQuery(GENERATE_SLUG, {
    onCompleted: (data) => {
      if (data?.generateSlugs?.oData) {
        const newSlug = normalizeSlugValue(data.generateSlugs.oData.sSlug, categoryURL)
        if (!checkSlugDone.current && data.generateSlugs.oData.bIsExists) {
          setValue('oSeo.sCUrl', prefixSlugValue(newSlug, categoryURL))
          setSlug(data.generateSlugs.oData)
          updateSlug(newSlug)
          setAvailableSlug('')
          clearErrors('frontSlug')
          setIsOpen(false)
        }
        if (!data.generateSlugs.oData.bIsExists && !newSlug) {
          const nextSlug = normalizeSlugValue(sValue, categoryURL)

          updateSlug(nextSlug)
          setValue('oSeo.sCUrl', prefixSlugValue(nextSlug, categoryURL))
          setValue('oSeo.sSlug', nextSlug)
          setIsOpen(false)
        }
        if (data.generateSlugs.oData.bIsExists && checkSlugDone.current) {
          setAvailableSlug(newSlug)
          setError('frontSlug', { type: 'manual', message: validationErrors.notAvailable })
          checkSlugDone.current = false
        }
        if (falsySlug && !data.generateSlugs.oData.bIsExists && !checkSlugDone.current) {
          if (!falsySlug.includes(' ')) {
            const nextSlug = normalizeSlugValue(falsySlug, categoryURL)

            updateSlug(nextSlug)
            setValue('frontSlug', nextSlug)
            setValue('oSeo.sCUrl', prefixSlugValue(nextSlug, categoryURL))
            setValue('oSeo.sSlug', nextSlug)
          }
        }
        if (newSlug && !isEditOpen && categoryURL) setIsOpen(true)
      }
    }
  })

  function handleChange({ target }) {
    if (target.value) {
      setsValue(target.value)
    }
  }

  useEffect(() => {
    sTitle && generateSlugs({ variables: { sSlug: categoryURL + sTitle } })
  }, [sTitle])

  useEffect(() => {
    if (values?.oSeo?.sSlug) {
      const nextSlug = normalizeSlugValue(values.oSeo.sSlug, categoryURL)

      setsValue(nextSlug)
      updateSlug(nextSlug)
    }
  }, [categoryURL, values?.oSeo?.sSlug])

  function setSlug(data) {
    const nextSlug = normalizeSlugValue(data?.sSlug, categoryURL)

    if (nextSlug) {
      setValue('frontSlug', nextSlug)
      setValue('oSeo.sSlug', nextSlug)
      setValue('oSeo.sCUrl', prefixSlugValue(nextSlug, categoryURL))
    } else {
      clearErrors('frontSlug')
      setAvailableSlug('')
    }
    if (sTitle && !values.frontSlug && nextSlug) {
      setsValue(nextSlug)
    }
    if (nextSlug && !values.frontSlug) {
      updateSlug(nextSlug)
      setValue('frontSlug', nextSlug)
      setValue('oSeo.sSlug', nextSlug)
      setValue('oSeo.sCUrl', prefixSlugValue(nextSlug, categoryURL))
      clearErrors('frontSlug')
      setAvailableSlug('')
      setIsOpen(false)
    }
  }
  function changeSlug() {
    const nextSlug = normalizeSlugValue(sValue, categoryURL)

    if (normalizeSlugValue(defaultSlug, categoryURL) !== nextSlug) {
      generateSlugs({ variables: { sSlug: prefixSlugValue(nextSlug, categoryURL) } })
      checkSlugDone.current = true
    } else {
      setIsOpen(false)
    }
  }
  useEffect(() => {
    if (categoryURL && sValue) {
      generateSlugs({ variables: { eType: slugType, sSlug: prefixSlugValue(sValue, categoryURL) } })
    }
  }, [categoryURL])

  useEffect(() => {
    if (errors?.frontSlug) setIsOpen(true)
  }, [errors])

  useEffect(() => {
    if (!isEditOpen) {
      unregister && unregister('frontSlug')
      clearErrors('frontSlug')
    }
  }, [clearErrors, isEditOpen, unregister])

  function closeEdit() {
    const nextSlug = normalizeSlugValue(slug, categoryURL)

    setValue('frontSlug', nextSlug)
    setValue('oSeo.sSlug', nextSlug)
    setValue('oSeo.sCUrl', prefixSlugValue(nextSlug, categoryURL))
    clearErrors('frontSlug')
    setIsOpen(!isEditOpen)
  }

  async function copyPermaLink() {
    try {
      await navigator.clipboard.writeText(`${URL_PREFIX}${prefixSlugValue(slug, categoryURL)}`)
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: <FormattedMessage id="permaLinkCopied" />, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const permalink = prefixSlugValue(slug, categoryURL)

  return (
    <>
      <div className="permalink">
        <div className="d-flex align-items-center w-100">
          <p className="title-txt">
            <FormattedMessage id="permalink" />:
          </p>
          <a className="link" href={`${URL_PREFIX}${permalink}`} target="_blank" rel="noreferrer">
            {URL_PREFIX}
            {permalink}
          </a>
          <div className="btn-div">
            <Button variant="link" className="square icon-btn" onClick={() => setIsOpen(!isEditOpen)} disabled={disabled}>
              <i className={`d-block icon-${isEditOpen ? 'close' : 'create'}`} />
            </Button>
            {slug && (
              <Button variant="link" className="square icon-btn" onClick={copyPermaLink}>
                <i className="icon-copy d-block" />
              </Button>
            )}
          </div>
        </div>
        {isEditOpen && (
          <Form.Group className="form-group mb-0 mt-1">
            {(() => {
              const frontSlugInput = register('frontSlug', {
                required: validationErrors.required,
                pattern: { value: CUSTOM_URL_WITH_SLASH, message: validationErrors.customURLWithSlash }
              })

              return (
                <InputGroup>
                  <InputGroup.Text>
                    {URL_PREFIX}
                    {categoryURL}
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="frontSlug"
                    {...frontSlugInput}
                    onChange={(e) => {
                      frontSlugInput.onChange(e)
                      handleChange(e)
                    }}
                    className={errors.frontSlug && 'error'}
                    defaultValue={slug}
                  />
                  <div className="btn-p d-flex align-items-center">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={changeSlug}
                      disabled={!sValue || normalizeSlugValue(defaultSlug, categoryURL) === normalizeSlugValue(sValue, categoryURL)}
                    >
                      <FormattedMessage id="done" />
                    </Button>
                    <Button variant="link" className="square text-white" size="sm" onClick={closeEdit}>
                      <FormattedMessage id="cancel" />
                    </Button>
                  </div>
                </InputGroup>
              )
            })()}
            {availableSlug && (
              <Form.Text>
                <FormattedMessage id="suggestedSlug" />: {availableSlug}
              </Form.Text>
            )}
            {errors.frontSlug && <Form.Control.Feedback type="invalid">{errors.frontSlug.message}</Form.Control.Feedback>}
          </Form.Group>
        )}
      </div>
    </>
  )
}
Permalink.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  values: PropTypes.object,
  setValue: PropTypes.func,
  setError: PropTypes.func,
  clearErrors: PropTypes.func,
  unregister: PropTypes.func,
  sTitle: PropTypes.string,
  categoryURL: PropTypes.string,
  slugType: PropTypes.string,
  defaultSlug: PropTypes.string,
  disabled: PropTypes.bool,
  falsySlug: PropTypes.string
}
export default Permalink
