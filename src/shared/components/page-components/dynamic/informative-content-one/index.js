import React from 'react'
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'
import { Form, Row, Col } from 'react-bootstrap'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import TinyEditor from 'shared/components/editor'

export default function InformativeContentOne({ basePath = 'oHomePage.oICType1' }) {
  const {
    register,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
    control
  } = useFormContext()

  return (
    <Row>
      <Col xs={12}>
        <Form.Label>Home page main content</Form.Label>
      </Col>
      <Col sm="8">
        <CountInput
          type="text"
          register={register(`${basePath}.sTitle`)}
          error={errors}
          name={`${basePath}.sTitle`}
          label="Title"
        />
        <TinyEditor name={`${basePath}.sDescription`} control={control} onlyTextFormatting minHeight={500} height = {200} />
      </Col>
      <Col sm="4" className="add-article">
        <CategoryPlayerTeamImage
          galleryType="ic1"
          name={`${basePath}.oImg`}
          register={register}
          setValue={setValue}
          // onDelete={console.log}
          values={getValues()}
          errors={errors}
          clearErrors={clearErrors}
          // imgUrl={reset}
          hideAttribution
          hideCaption
        />
      </Col>
    </Row>
  )
}

InformativeContentOne.propTypes = {
  basePath: PropTypes.string
}
