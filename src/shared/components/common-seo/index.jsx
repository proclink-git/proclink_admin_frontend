import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Nav, Tab } from 'react-bootstrap'
import { useLazyQuery } from '@apollo/client'
import Select from 'react-select'
import { FormattedMessage, useIntl } from 'react-intl'
import { Controller, useWatch } from 'react-hook-form'

import CountInput from '../count-input'
import { META_ROBOTS, URL_PREFIX, CUSTOM_URL_WITH_SLASH } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { GENERATE_SLUG } from 'graph-ql/generate-slug/query'
import CommonInput from '../common-input'
import Social from './social'

function CommonSEO({
  register,
  errors,
  schemaType,
  values,
  setError,
  clearErrors,
  slug,
  setValue,
  title,
  fbImg,
  twitterImg,
  id,
  hidden,
  control,
  extraSlug,
  slugType,
  defaultData,
  disabled,
  categoryURL,
  hideCustomSlug,
  removeParentCategory,
  onUpdateData
}) {
  const [availableSlug, setAvailableSlug] = useState()
  const [validation, setValidation] = useState({ sDescription: false })

  const metaTitle = useWatch({
    control,
    name: 'oSeo.sTitle'
  })

  const [generateSlugs] = useLazyQuery(GENERATE_SLUG)

  async function handleChange(e) {
    if (e.target.value && !errors?.oSeo?.sSlug) {
      setValue('oSeo.sCUrl', e.target.value.toLowerCase())
      if (
        (!defaultData?.oSeo && e.target.value !== defaultData?.sSlug) ||
        (defaultData?.oSeo && e.target.value !== defaultData?.oSeo?.sSlug)
      ) {
        setValue('oSeo.sSlug', e.target.value.toLowerCase())
        const url = categoryURL && !removeParentCategory ? categoryURL + e.target.value : e.target.value
        const { data } = await generateSlugs({ variables: { sSlug: url } })
        if (data?.generateSlugs?.oData) {
          handleSlugResponce(data.generateSlugs?.oData, false)
        }
      }
    }
  }

  useEffect(async () => {
    if (hidden && !id && slug) {
      const { data } = await generateSlugs({ variables: { sSlug: slug } })
      if (data?.generateSlugs?.oData) {
        handleSlugResponce(data.generateSlugs?.oData, true)
      }
    }
  }, [slug, hidden])

  useEffect(() => {
    if (metaTitle) {
      handleInputChange({ target: { value: metaTitle } }, 'sTitle')
    }
  }, [metaTitle])

  useEffect(() => {
    if (defaultData?.oSeo?.eType === 'fa' || defaultData?.oSeo?.eType === 'ar') {
      if (defaultData?.eState === 'p' || defaultData?.eState === 'pub') {
        setValidation({ ...validation, sDescription: validationErrors.required })
      }
    }
  }, [defaultData])

  function handleInputChange({ target }, name) {
    !values?.oSeo?.oFB && setValue(`oSeo.oFB.${name}`, target.value)
    !values?.oSeo?.oTwitter && setValue(`oSeo.oTwitter.${name}`, target.value)
  }

  function handleSlugResponce(oData, isFromTitle) {
    if (oData.sSlug) {
      setAvailableSlug(oData.sSlug)
      setError('oSeo.sSlug', { type: 'manual', message: validationErrors.notAvailable })
    } else {
      clearErrors('oSeo.sSlug')
      setAvailableSlug('')
    }
    if (
      ((oData.sSlug && slugType === 't') || (oData.sSlug && slugType === 'p')) &&
      !values.oSeo.sSlug
    ) {
      if (isFromTitle && categoryURL) setValue('oSeo.sSlug', oData?.sSlug?.replace(categoryURL, ''))
      else setValue('oSeo.sSlug', oData.sSlug)
      // extraSlug && setValue(extraSlug, oData.sSlug)
      clearErrors('oSeo.sSlug')
      setAvailableSlug('')
    }
    if (oData.sSlug && !values.oSeo.sSlug) {
      if (isFromTitle && categoryURL) setValue('oSeo.sSlug', oData?.sSlug?.replace(categoryURL, ''))
      else setValue('oSeo.sSlug', oData.sSlug)
      // extraSlug && setValue(extraSlug, oData.sSlug)
      clearErrors('oSeo.sSlug')
      setAvailableSlug('')
    }
    // if (!oData.sSlug && values.oSeo.sSlug && extraSlug) {
    //   setValue(extraSlug, values.oSeo.sSlug)
    // }
    if (!values.oSeo.sSlug && !oData.sSlug && slug) {
      if (isFromTitle && categoryURL) setValue('oSeo.sSlug', slug?.replace(categoryURL, ''))
      else setValue('oSeo.sSlug', slug)
    }
  }

  return (
    <div className="seo-tab">
      {title && (
        <h1 className="m-title">
          <FormattedMessage id="seo" />
        </h1>
      )}
      <Tab.Container defaultActiveKey="General">
        <Nav variant="tabs" className="common-tabs">
          <Nav.Item>
            <Nav.Link eventKey="General">
              <FormattedMessage id="general" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="Social">
              <FormattedMessage id="social" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="Advance">
              <FormattedMessage id="advance" />
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="General">
            <h2 className="title-txt">
              <FormattedMessage id="affectsYourPage" />
              &apos;
              <FormattedMessage id="sSEO" />.
            </h2>
            <CountInput
              maxWord={70}
              currentLength={values?.oSeo?.sTitle?.length}
              label={useIntl().formatMessage({ id: 'metaTitle' })}
              name="oSeo.sTitle"
              error={errors}
              register={register('oSeo.sTitle', { maxLength: { value: 70, message: validationErrors.maxLength(70) } })}
              disabled={disabled}
              onBlur={(e) => handleInputChange(e, 'sTitle')}
            />
            {!hideCustomSlug && (
              <div id='seo-slug'>
                <CommonInput
                  type="text"
                  register={register}
                  urlPrifix={URL_PREFIX}
                  errors={errors}
                  onBlur={handleChange}
                  className={errors?.oSeo?.sSlug && 'error'}
                  validation={{ pattern: { value: CUSTOM_URL_WITH_SLASH, message: validationErrors.customURLWithSlash } }}
                  name="oSeo.sSlug"
                  label="customSlug"
                  availableSlug={availableSlug}
                  altTextLabel="suggestedSlug"
                  categoryURL={categoryURL || ''}
                  required
                />
              </div>
            )}
            <CountInput
              textarea
              maxWord={160}
              currentLength={values?.oSeo?.sDescription?.length}
              label={`${useIntl().formatMessage({ id: 'metaDescription' })}${validation.sDescription ? '*' : ''}`}
              name="oSeo.sDescription"
              error={errors}
              register={register('oSeo.sDescription', {
                required: validation.sDescription,
                maxLength: { value: 160, message: validationErrors.maxLength(160) }
              })}
              disabled={disabled}
              onBlur={(e) => handleInputChange(e, 'sDescription')}
            />
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oSeo?.aKeywords && 'error'}
              disabled={disabled}
              name="oSeo.aKeywords"
              label="metaKeyword"
              toolTipText="metaKeywordToolTip"
            />
            {schemaType && (
              <Form.Group className="form-group d-sm-flex radio-group">
                {/* <input type="hidden" name="oSeo.eSchemaType" {...register('oSeo.eSchemaType')} /> */}
                {/* <input type="hidden" name="oSeo.eSchemaType" {...register('oSeo.eType')} /> */}
                <Form.Label className="mb-0">
                  <FormattedMessage id="SchemaType" />
                </Form.Label>
                <Form.Check
                  value={'nar'}
                  type="radio"
                  label={useIntl().formatMessage({ id: 'newsArticle' })}
                  className="mb-0"
                  name="eSchemaType"
                  {...register('oSeo.eSchemaType')}
                  id="newsArticle"
                  defaultChecked={values?.oSeo?.eSchemaType === 'nar'}
                  // onChange={handleTypeChange}
                  disabled={disabled}
                />
                <Form.Check
                  value={'ar'}
                  type="radio"
                  label={useIntl().formatMessage({ id: 'article' })}
                  className="mb-0"
                  name="eSchemaType"
                  {...register('oSeo.eSchemaType')}
                  id="Article"
                  defaultChecked={values?.oSeo?.eSchemaType === 'ar'}
                  // onChange={handleTypeChange}
                  disabled={disabled}
                />
              </Form.Group>
            )}
          </Tab.Pane>
          <Tab.Pane eventKey="Social">
            <Social
              register={register}
              errors={errors}
              values={values}
              fbImg={fbImg}
              twitterImg={twitterImg}
              defaultData={defaultData}
              onUpdateData={onUpdateData}
              disabled={disabled}
              setValue={setValue}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="Advance">
            <h2 className="title-txt">
              <FormattedMessage id="affectsYourPage" />
              &apos;
              <FormattedMessage id="sSEO" />.
            </h2>
            <CommonInput
              type="text"
              register={register}
              urlPrifix={URL_PREFIX}
              errors={errors}
              className={errors?.oSeo?.sCUrl && 'error'}
              validation={{ pattern: { value: CUSTOM_URL_WITH_SLASH, message: validationErrors.customURLWithSlash } }}
              name="oSeo.sCUrl"
              label="canonicalURL"
              categoryURL={categoryURL || ''}
            />
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="metaRobotsAdvanced" />
              </Form.Label>
              <Controller
                name="oSeo.sRobots"
                control={control}
                render={({ field: { onChange, value, ref } }) => (
                  <Select
                    ref={ref}
                    value={{ label: value || META_ROBOTS[0], value: value || META_ROBOTS[0] }}
                    options={META_ROBOTS.map((t) => ({ label: t, value: t?.toLowerCase() }))}
                    className="react-select"
                    classNamePrefix="select"
                    isSearchable={false}
                    isDisabled={disabled}
                    onChange={(e) => {
                      onChange(e.value)
                    }}
                  />
                )}
              />
            </Form.Group>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  )
}
CommonSEO.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  schemaType: PropTypes.bool,
  title: PropTypes.bool,
  values: PropTypes.object,
  slug: PropTypes.string,
  setError: PropTypes.func,
  clearErrors: PropTypes.func,
  setValue: PropTypes.func,
  fbImg: PropTypes.string,
  twitterImg: PropTypes.string,
  id: PropTypes.string,
  hidden: PropTypes.bool,
  control: PropTypes.object,
  extraSlug: PropTypes.string,
  slugType: PropTypes.string,
  defaultData: PropTypes.object,
  disabled: PropTypes.bool,
  categoryURL: PropTypes.string,
  hideCustomSlug: PropTypes.bool,
  removeParentCategory: PropTypes.bool,
  onUpdateData: PropTypes.func
}
export default CommonSEO
