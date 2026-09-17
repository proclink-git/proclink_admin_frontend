import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import CareerBannerSection from '../home-page-static/career-banner-section'
import FaqSection from '../industry-detail-static/faq-section'
import ImageDimensionNote from 'shared/components/image-dimension-note'

function getDefaultLogo() {
  return {
    sName: '',
    oImg: {
      sUrl: '',
      sText: '',
      sCaption: '',
      sAttribute: ''
    }
  }
}

function PartnershipsOverviewSection({ basePath = 'oPartnershipsAlliancesPage.oPAA' }) {
  const {
    register,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Partnerships and Alliances</Form.Label>
      <Row>
        <Col sm="8">
          <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
          <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />
        </Col>
        <Col sm="4" className="add-article">
          <ImageDimensionNote width={1920} height={560} subject="image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Image"
            name={`${basePath}.oImg`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            hideAttribution
          />
        </Col>
      </Row>
    </div>
  )
}

PartnershipsOverviewSection.propTypes = {
  basePath: PropTypes.string
}

function PartnershipsLogoSection({ basePath = 'oPartnershipsAlliancesPage.oPAL' }) {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aLogo`
  })

  useEffect(() => {
    const currentItems = getValues(`${basePath}.aLogo`)
    if (!fields.length && (!Array.isArray(currentItems) || !currentItems.length)) append(getDefaultLogo())
  }, [append, basePath, fields.length, getValues])

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Partner Logos</Form.Label>
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultLogo())} variant="link" size="sm" className="square icon-btn">
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
          <Form.Label>Logo {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput
                type="text"
                currentLength={values?.aLogo?.[index]?.sName?.length}
                register={register(`${basePath}.aLogo[${index}].sName`)}
                error={errors}
                name={`${basePath}.aLogo[${index}].sName`}
                label="Name"
              />
            </Col>
            <Col sm="4" className="add-article">
              <ImageDimensionNote width={100} height={100} subject="logo" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Logo"
                name={`${basePath}.aLogo[${index}].oImg`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

PartnershipsLogoSection.propTypes = {
  basePath: PropTypes.string
}

function PartnershipsFaqSection({ basePath = 'oPartnershipsAlliancesPage.oFAQ' }) {
  return <FaqSection basePath={basePath} sectionLabel="FAQ" itemsLabel="FAQ Items" />
}

function PartnershipsCareerBannerSection({ basePath = 'oPartnershipsAlliancesPage.oCB' }) {
  return <CareerBannerSection basePath={basePath} sectionLabel="Career Banner" />
}

PartnershipsFaqSection.propTypes = {
  basePath: PropTypes.string
}

PartnershipsCareerBannerSection.propTypes = {
  basePath: PropTypes.string
}

const componentMap = {
  paa: PartnershipsOverviewSection,
  pal: PartnershipsLogoSection,
  faq: PartnershipsFaqSection,
  cb: PartnershipsCareerBannerSection
}

export default function PartnershipsAlliancesPageStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.sComponentTitle || component?.iId?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

PartnershipsAlliancesPageStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
