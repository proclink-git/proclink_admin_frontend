import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { Controller, useFieldArray } from 'react-hook-form'
import { validationErrors } from 'shared/constants/ValidationErrors'
import Select from 'react-select'
import { FormattedMessage } from 'react-intl'

import { SOCIAL_LIST, URL_REGEX } from 'shared/constants'

function SocialLinks({ register, control, clearErrors, trigger, errors, values }) {
  const [socialValidation, setSocialValidation] = useState([{ eSocialNetworkType: false, sDisplayName: false, sLink: false }])
  const [selectedMedia, setSelectedMedia] = useState([])
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aSocialProfiles'
  })

  useEffect(() => {
    if (values.aSocialProfiles.length) {
      const data = values.aSocialProfiles.map((ele) => {
        return {
          eSocialNetworkType: ele.eSocialNetworkType ? validationErrors.required : false,
          // sDisplayName: ele.sDisplayName ? validationErrors.required : false,
          sLink: ele.sLink ? validationErrors.required : false
        }
      })
      setSocialValidation(data)
    }
    const mediaSelected = values.aSocialProfiles.map((ele) => ele.eSocialNetworkType)
    setSelectedMedia(mediaSelected)
  }, [values?.aSocialProfiles])

  function handleChange(e, index) {
    const data = socialValidation
    if (e.target.value) {
      Object.keys(data[index]).forEach((key) => {
        data[index][key] = validationErrors.required
      })
      setSocialValidation(data)
    } else if (e.target.value === '') {
      if (Object.values(values.aSocialProfiles[index]).every((x) => x === '')) {
        Object.keys(data[index]).forEach((key) => {
          data[index][key] = false
        })
        setSocialValidation(data)
        clearErrors([
          `aSocialProfiles[${index}].eSocialNetworkType`,
          // `aSocialProfiles[${index}].sDisplayName`,
          `aSocialProfiles[${index}].sLink`
        ])
      }
    }
    const mediaSelected = values.aSocialProfiles.map((ele) => ele.eSocialNetworkType)
    setSelectedMedia(mediaSelected)
    trigger()
  }

  function createSocialField(value) {
    return {
      eSocialNetworkType: value,
      // sDisplayName: value,
      sLink: value
    }
  }

  function addMoreSocialProfile() {
    setSocialValidation([...socialValidation, createSocialField(false)])
    append(createSocialField(''))
  }

  function removeSocialProfile(index) {
    remove(index)
    socialValidation.splice(index, 1)
    setSocialValidation(socialValidation)
    setSelectedMedia(selectedMedia.filter((item) => item !== values.aSocialProfiles[index].eSocialNetworkType))
  }
  return (
    <>
      <h5 className="title-text title-font mb-3 text-uppercase">
        <FormattedMessage id="socialLinks" />
      </h5>
      {fields.map((field, index) => {
        return (
          <Row key={field.id}>
            <Col md="5" sm="6">
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="socialNetwork" />
                </Form.Label>
                <i className="icon-chevron-down"></i>
                <Controller
                  name={`aSocialProfiles[${index}].eSocialNetworkType`}
                  control={control}
                  rules={{ required: socialValidation[index]?.eSocialNetworkType }}
                  render={({ field: { onChange, value, ref } }) => (
                    <Select
                      ref={ref}
                      value={SOCIAL_LIST.filter((x) => x.value === value)[0]}
                      options={SOCIAL_LIST.map((s) => (selectedMedia.includes(s.value) ? { ...s, isDisabled: true } : s))}
                      className={`react-select ${errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.eSocialNetworkType && 'error'}`}
                      classNamePrefix="select"
                      isSearchable={false}
                      onChange={(e) => {
                        onChange(e.value)
                      }}
                      onBlur={(e) => handleChange({ target: { value } }, index)}
                    />
                  )}
                />
                {errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.eSocialNetworkType && (
                  <Form.Control.Feedback type="invalid">{errors?.aSocialProfiles[index]?.eSocialNetworkType.message}</Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            {/* <Col md="3" sm="6">
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="displayName" />
                </Form.Label>
                <Form.Control
                  type="text"
                  name={`aSocialProfiles[${index}].sDisplayName`}
                  className={errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.sDisplayName && 'error'}
                  {...register(`aSocialProfiles[${index}].sDisplayName`, {
                    required: socialValidation[index]?.sDisplayName,
                    maxLength: { value: 10000, message: validationErrors.maxLength(10000) }
                  })}
                  onBlur={(e) => {
                    e.target.value = e?.target?.value.trim()
                    handleChange(e, index)
                  }}
                />
                {errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.sDisplayName && (
                  <Form.Control.Feedback type="invalid">{errors?.aSocialProfiles[index]?.sDisplayName.message}</Form.Control.Feedback>
                )}
              </Form.Group>
            </Col> */}
            <Col md="6" sm="10">
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="link" />
                </Form.Label>
                <Form.Control
                  type="text"
                  className={errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.sLink && 'error'}
                  name={`aSocialProfiles[${index}].sLink`}
                  {...register(`aSocialProfiles[${index}].sLink`, {
                    required: socialValidation[index]?.sLink,
                    pattern: { value: URL_REGEX, message: validationErrors.url },
                    maxLength: { value: 10000, message: validationErrors.maxLength(10000) }
                  })}
                  onBlur={(e) => {
                    e.target.value = e?.target?.value.trim()
                    handleChange(e, index)
                  }}
                />
                {errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.sLink && (
                  <Form.Control.Feedback type="invalid">{errors?.aSocialProfiles[index]?.sLink.message}</Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col md="1" sm="2">
              <Button onClick={() => removeSocialProfile(index)} variant="link" className="social-btn">
                <i className="icon-delete d-block " />
              </Button>
            </Col>
          </Row>
        )
      })}
      {fields.length < SOCIAL_LIST.length && (
        <Button
          onClick={addMoreSocialProfile}
          variant="link"
          className="square add-media hover-none"
          disabled={!values.aSocialProfiles.every((item) => Object.values(item).every((x) => x !== ''))}
        >
          <i className="icon-add" />
          <FormattedMessage id="addSocialProfiles" />
        </Button>
      )}
    </>
  )
}

SocialLinks.propTypes = {
  register: PropTypes.func,
  control: PropTypes.object,
  values: PropTypes.object,
  clearErrors: PropTypes.func,
  trigger: PropTypes.func,
  errors: PropTypes.object
}

export default SocialLinks
