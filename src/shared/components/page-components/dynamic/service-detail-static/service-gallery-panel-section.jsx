import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import TinyEditor from 'shared/components/editor'
import TitleFormatHint from 'shared/components/title-format-hint'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function ServiceGalleryPanelSection({ basePath = 'oSGP' }) {
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

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Service Gallery Panel</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />

      <div className="form-group">
        <Form.Label>Content</Form.Label>
        <TinyEditor name={`${basePath}.sContent`} control={control} onlyTextFormatting minHeight={300} />
      </div>

      <Row>
        <Col md="6" className="add-article">
        <ImageDimensionNote width={355} height={130} subject="top left image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Top Left Image"
            name={`${basePath}.oImgTopLeft`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            hideAttribution
          />
        </Col>
        <Col md="6" className="add-article">
        <ImageDimensionNote width={456} height={291} subject="top right image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Top Right Image"
            name={`${basePath}.oImgTopRight`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            hideAttribution
          />
        </Col>
      </Row>

      <Row>
        <Col md="6" className="add-article">
        <ImageDimensionNote width={355} height={329} subject="bottom left image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Bottom Left Image"
            name={`${basePath}.oImgBottomLeft`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            hideAttribution
          />
        </Col>
        <Col md="6" className="add-article">
        <ImageDimensionNote width={456} height={168} subject="bottom right image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Bottom Right Image"
            name={`${basePath}.oImgBottomRight`}
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

ServiceGalleryPanelSection.propTypes = {
  basePath: PropTypes.string
}
