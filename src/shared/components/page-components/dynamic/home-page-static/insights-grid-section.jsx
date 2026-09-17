import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultInsightCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function InsightsGridSection({ basePath = 'oHomePage.oINS' }) {
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
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultInsightCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Insights Grid</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title*" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description*" />

      <Row className="gutter-9">
        {fields.map((field, index) => (
          <Col sm="6" key={field.id} className="mb-3">
            <InputArrayBox
              className="h-100"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button type="button" onClick={() => append(getDefaultInsightCard())} variant="link" size="sm" className="square icon-btn">
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
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sBadge?.length} register={register(`${basePath}.aCard[${index}].sBadge`)} error={errors} name={`${basePath}.aCard[${index}].sBadge`} label="Badge" />
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Card Title*" />
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sRedirectUrl`} label="Redirect Url*" disableDefaultMaxLength />
              <div className="add-article">
                <ImageDimensionNote width={263} height={260} subject="insights grid image" />
                <CategoryPlayerTeamImage
                  galleryType="pb"
                  title={`Image ${index + 1}*`}
                  name={`${basePath}.aCard[${index}].oImg`}
                  register={register}
                  setValue={setValue}
                  values={getValues()}
                  errors={errors}
                  clearErrors={clearErrors}
                  hideAttribution
                />
              </div>
            </InputArrayBox>
          </Col>
        ))}
      </Row>
    </div>
  )
}

InsightsGridSection.propTypes = {
  basePath: PropTypes.string
}
