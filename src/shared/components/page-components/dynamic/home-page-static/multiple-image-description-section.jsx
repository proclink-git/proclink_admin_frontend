import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import TitleFormatHint from 'shared/components/title-format-hint'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function MultipleImageDescriptionSection({
  basePath = 'oHomePage.oMID',
  sectionLabel = 'Multiple Image Description',
  imageDimensionSubject = 'multiple image description image',
  imageWidth,
  imageHeight
}) {
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
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>
      <Row>
        <Col sm="8">
          <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title*" />
          <TitleFormatHint subject="title" />
          <div className="form-group">
            <Form.Label>Description</Form.Label>
            <CountInput textarea rows={10} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} />
          </div>
        </Col>
        <Col sm="4" className="add-article">
          <ImageDimensionNote width={imageWidth} height={imageHeight} subject={imageDimensionSubject} />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Image*"
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

MultipleImageDescriptionSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  imageDimensionSubject: PropTypes.string,
  useRichTextDescription: PropTypes.bool,
  descriptionMinHeight: PropTypes.number,
  imageWidth: PropTypes.number,
  imageHeight: PropTypes.number
}
