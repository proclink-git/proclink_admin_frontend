import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultFocusAreaCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function ServiceProcessSection({ basePath = 'oHIP' }) {
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

  const fieldArrayName = `${basePath}.aCard`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultFocusAreaCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">How Implementation Programs Are Delivered</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <div className="add-article mb-3">
        <ImageDimensionNote width={824} height={740} subject="how implementation programs are delivered image" />
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
      </div>

      <Form.Label className="text-uppercase small text-muted mb-2">Process Cards</Form.Label>

      <Row>
        {fields.map((field, index) => (
          <Col md="6" key={field.id}>
            <InputArrayBox
              className="mb-3"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button type="button" onClick={() => append(getDefaultFocusAreaCard())} variant="link" size="sm" className="square icon-btn">
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
              <Form.Label>Card {index + 1}</Form.Label>
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Title" />
              <CountInput textarea rows={5} currentLength={values?.aCard?.[index]?.sDescription?.length} register={register(`${basePath}.aCard[${index}].sDescription`)} error={errors} name={`${basePath}.aCard[${index}].sDescription`} label="Description" />
            </InputArrayBox>
          </Col>
        ))}
      </Row>
    </div>
  )
}

ServiceProcessSection.propTypes = {
  basePath: PropTypes.string
}
