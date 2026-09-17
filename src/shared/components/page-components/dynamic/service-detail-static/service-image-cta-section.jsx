import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import TitleFormatHint from 'shared/components/title-format-hint'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function ServiceImageCtaSection({ basePath = 'oSIC' }) {
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
      <Form.Label className="text-uppercase small text-muted mb-3">Service Implementation CTA</Form.Label>
      <Row>
        <Col sm="8">
          <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
          <TitleFormatHint subject="title" />
          <CountInput textarea rows={8} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />
          <CountInput type="text" currentLength={values?.oCta?.sLabel?.length} register={register(`${basePath}.oCta.sLabel`)} error={errors} name={`${basePath}.oCta.sLabel`} label="Button Label" />
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.oCta.sUrl`} label="Button Link" disableDefaultMaxLength />
        </Col>
        <Col sm="4" className="add-article">
          <ImageDimensionNote width={1920} height={935} subject="service implementation cta image" />
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

ServiceImageCtaSection.propTypes = {
  basePath: PropTypes.string
}
