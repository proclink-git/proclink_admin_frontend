import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { EMAIL } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import HomeBannerSection from '../home-page-static/home-banner-section'
import CareerBannerSection from '../home-page-static/career-banner-section'
import ContactUsFormSection from './contact-us-form-section'

function getDefaultContactInfo() {
  return {
    sTitle: '',
    sContact: '',
    sEmail: ''
  }
}

function ContactPageContactsSection({ basePath = 'oContactUsPage.oCCC' }) {
  const {
    register,
    control,
    watch,
    getValues,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aContact`
  })

  useEffect(() => {
    const currentItems = getValues(`${basePath}.aContact`)
    if (!fields.length && (!Array.isArray(currentItems) || !currentItems.length)) append(getDefaultContactInfo())
  }, [append, basePath, fields.length, getValues])

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Contact Cards</Form.Label>
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultContactInfo())} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-add d-block" />
                </Button>
              )}
              {fields.length > 1 && (
                <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-delete d-block" />
                </Button>
              )}
            </>
          }
        >
          <Form.Label>Contact {index + 1}</Form.Label>
          <CountInput
            type="text"
            currentLength={values?.aContact?.[index]?.sTitle?.length}
            register={register(`${basePath}.aContact[${index}].sTitle`)}
            error={errors}
            name={`${basePath}.aContact[${index}].sTitle`}
            label="Title"
          />
          <Row>
            <Col md="6">
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aContact[${index}].sContact`} label="Contact Number" disableDefaultMaxLength />
            </Col>
            <Col md="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                name={`${basePath}.aContact[${index}].sEmail`}
                label="Email"
                validation={{ pattern: { value: EMAIL, message: validationErrors.email } }}
                disableDefaultMaxLength
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

ContactPageContactsSection.propTypes = {
  basePath: PropTypes.string
}

function ContactPageHomeBannerSection({ basePath = 'oContactUsPage.oHPB' }) {
  return <HomeBannerSection basePath={basePath} showCtaSection={false} />
}

function ContactPageFormSection({ basePath = 'oContactUsPage.oCUF' }) {
  return <ContactUsFormSection basePath={basePath} />
}

function ContactPageCareerBannerSection({ basePath = 'oContactUsPage.oCB' }) {
  return <CareerBannerSection basePath={basePath} sectionLabel="Career Banner" />
}

ContactPageHomeBannerSection.propTypes = {
  basePath: PropTypes.string
}

ContactPageFormSection.propTypes = {
  basePath: PropTypes.string
}

ContactPageCareerBannerSection.propTypes = {
  basePath: PropTypes.string
}

const componentMap = {
  hpb: ContactPageHomeBannerSection,
  cuf: ContactPageFormSection,
  ccc: ContactPageContactsSection,
  cb: ContactPageCareerBannerSection
}

export default function ContactPageStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.sComponentTitle || component?.iId?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

ContactPageStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
