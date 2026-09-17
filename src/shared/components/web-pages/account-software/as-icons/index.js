import React from 'react'
import PropTypes from 'prop-types'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button, Col, Row } from 'react-bootstrap'

import InputArrayBox from 'shared/components/input-array-box'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'

export default function ASIcon({ parentIndex }) {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    getValues
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `oAccountingSoftware.aData.${parentIndex}.aIcon`
  })
  return (
    <Row className="gutter-9">
      {fields.map((item, index) => (
        <Col sm={4} className="add-article" key={item.id}>
          <InputArrayBox
            actions={
              <>
                {index + 1 === fields.length && (
                  <Button onClick={() => append({ sUrl: '', sText: '' })} variant="link" size="sm" className="square icon-btn">
                    <i className="icon-add d-block" />
                  </Button>
                )}
                {fields.length > 1 && (
                  <Button onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                    <i className="icon-delete d-block" />
                  </Button>
                )}
              </>
            }
          >
            <CategoryPlayerTeamImage
              galleryType="al"
              name={`oAccountingSoftware.aData.[${parentIndex}].aIcon.[${index}]`}
              register={register}
              setValue={setValue}
              // onDelete={handleDeleteImg}
              values={getValues()}
              errors={errors}
              required
              hideAttribution
              hideCaption
              // imgUrl={cmsData?.oImg?.sUrl}
            />
          </InputArrayBox>
        </Col>
      ))}
    </Row>
  )
}
ASIcon.propTypes = {
  parentIndex: PropTypes.number.isRequired
}
