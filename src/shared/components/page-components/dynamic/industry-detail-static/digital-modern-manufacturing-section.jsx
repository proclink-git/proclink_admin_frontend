import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import TinyEditor from 'shared/components/editor'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function DigitalModernManufacturingSection({ basePath = 'oDMM' }) {
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
      <Form.Label className="text-uppercase small text-muted mb-3">Digital Modern Manufacturing</Form.Label>

      <CountInput textarea rows={8} currentLength={values?.sMainDescription?.length} register={register(`${basePath}.sMainDescription`)} error={errors} name={`${basePath}.sMainDescription`} label="Main Description" />
      <Form.Label>Description</Form.Label>
      <TinyEditor name={`${basePath}.sDescription`} control={control} onlyTextFormatting minHeight={350} />

      <Row>
        <Col md="6" className="add-article mt-4">
          <ImageDimensionNote width={824} height={400} subject="digital modern manufacturing image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Left Image"
            name={`${basePath}.oImgLeft`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
          />
        </Col>
        <Col md="6" className="add-article mt-4">
          <ImageDimensionNote width={824} height={952} subject="digital modern manufacturing image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Right Image"
            name={`${basePath}.oImgRight`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
          />
        </Col>
      </Row>
    </div>
  )
}

DigitalModernManufacturingSection.propTypes = {
  basePath: PropTypes.string
}
