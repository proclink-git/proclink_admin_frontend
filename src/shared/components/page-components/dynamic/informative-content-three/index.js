import React from 'react'
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'
import { Row, Col, Form } from 'react-bootstrap'

import CommonInput from 'shared/components/common-input'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import TinyEditor from 'shared/components/editor'

export default function InformativeContentThree({ basePath = 'oICType3' }) {
  const {
    register,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
    control
  } = useFormContext()

  return (
    <Row className="gutter-9">
      <Col xs={12}>
        <Form.Label>Services main content</Form.Label>
      </Col>
      <Col sm="7">
        <CountInput
          type="text"
          register={register(`${basePath}.sTitle`)}
          error={errors}
          name={`${basePath}.sTitle`}
          label="H2"
        />
       <TinyEditor name={`${basePath}.sDescription`} control={control} onlyTextFormatting minHeight={500} />

        <CommonInput
          type="text"
          register={register}
          errors={errors}
          name={`${basePath}.sButtonText`}
          label="Button Text"
        />
        <CommonInput
          type="text"
          register={register}
          errors={errors}
          name={`${basePath}.sButtonLink`}
          label="Button Link"
        />
      </Col>
      <Col sm="5" className="add-article">
        <CategoryPlayerTeamImage
          galleryType="ic3"
          name={`${basePath}.oImg`}
          register={register}
          setValue={setValue}
          // onDelete={console.log}
          values={getValues()}
          errors={errors}
          clearErrors={clearErrors}
          // imgUrl={reset}
          hideCaption
          hideAttribution
        />
      </Col>
    </Row>
  )
}

InformativeContentThree.propTypes = {
  basePath: PropTypes.string
}
