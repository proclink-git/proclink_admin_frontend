/* eslint-disable no-unused-vars */
import React from 'react'
import PropTypes from 'prop-types'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button, Col, Row } from 'react-bootstrap'

import InputArrayBox from 'shared/components/input-array-box'
import CommonInput from 'shared/components/common-input'
import { URL_REGEX } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
// import { embedFromMap } from 'shared/utils'

export default function ContactAddress({ parentIndex }) {
  const {
    control,
    register,
    formState: { errors },
    getValues,
    setValue
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `oContactUsPage.aLocation.${parentIndex}.aAddress`
  })
  return fields.map((item, index) => (
    <Col sm={6} key={item.id}>
      <InputArrayBox
        key={item.id}
        actions={
          <>
            {index + 1 === fields.length && (
              <Button
                onClick={() => append({ sAddress: '', sCity: '', sLocationUrl: '' })}
                variant="link"
                size="sm"
                className="square icon-btn"
              >
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
        <Row>
          <Col sm={12}>
            <CommonInput
              type="textArea"
              register={register}
              errors={errors}
              className={errors?.oContactUsPage?.aLocation?.[parentIndex]?.aAddress?.[index]?.sAddress && 'error'}
              name={`oContactUsPage.aLocation[${parentIndex}].aAddress[${index}].sAddress`}
              label="Address"
              required
            />
          </Col>
          <Col sm={6}>
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oContactUsPage?.aLocation?.[parentIndex]?.aAddress?.[index]?.sCity && 'error'}
              name={`oContactUsPage.aLocation[${parentIndex}].aAddress[${index}].sCity`}
              displayClass="mb-0"
              label="City"
              required
            />
          </Col>
          <Col sm={6}>
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oContactUsPage?.aLocation?.[parentIndex]?.aAddress?.[index]?.sLocationUrl && 'error'}
              name={`oContactUsPage.aLocation[${parentIndex}].aAddress[${index}].sLocationUrl`}
              validation={{ pattern: { value: URL_REGEX, message: validationErrors.url } }}
              displayClass="mb-0"
              label="Map URL"
              required
            />
          </Col>
          <Col sm={12} className="add-article mt-2">
            <CategoryPlayerTeamImage
              galleryType="ci"
              name={`oContactUsPage.aLocation.${parentIndex}.aAddress.${index}.oImg`}
              register={register}
              setValue={setValue}
              values={getValues()}
              errors={errors}
              required
              hideAttribution
              hideCaption
            />
          </Col>
        </Row>
      </InputArrayBox>
    </Col>

  ))
}
ContactAddress.propTypes = {
  parentIndex: PropTypes.number.isRequired
}
