import React from 'react'
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'
import { Row, Col, Form } from 'react-bootstrap'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'

export default function InformativeContentTwo({ basePath = 'oAboutUs.oICType2' }) {
  const {
    register,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()

  return (
    <Row>
      <Col sm="8">
        <Col xs={12}>
          <Form.Label>About us main content</Form.Label>
        </Col>
        <CountInput
          type="text"
          register={register(`${basePath}.sTitle`)}
          error={errors}
          name={`${basePath}.sTitle`}
          label="H2"
        />
        <CountInput
          type="textarea"
          register={register(`${basePath}.sDescription`)}
          error={errors}
          textarea
          name={`${basePath}.sDescription`}
          label="Description"
          style={{ height: '200px' }}
        />
      </Col>
      <Col sm="4" className="add-article">
        <CategoryPlayerTeamImage
          galleryType="ic2"
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

InformativeContentTwo.propTypes = {
  basePath: PropTypes.string
}
