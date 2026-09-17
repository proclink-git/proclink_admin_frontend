import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import TinyEditor from 'shared/components/editor'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultServiceSolutionCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function SpecializedImplementationSolutionsSection({ basePath = 'oSIS' }) {
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
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultServiceSolutionCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Specialized Implementation Solutions</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <Form.Label className="text-uppercase small text-muted mb-2">Solution Cards</Form.Label>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultServiceSolutionCard())} variant="link" size="sm" className="square icon-btn">
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
          <Row>
            <Col md="4" className="add-article">
              <ImageDimensionNote width={818} height={640} subject="solution image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Image"
                name={`${basePath}.aCard[${index}].oImg`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </Col>
            <Col md="8">
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Title" />
              <div className="form-group">
                <Form.Label>Description</Form.Label>
                <TinyEditor name={`${basePath}.aCard[${index}].sDescription`} control={control} onlyTextFormatting minHeight={240} />
              </div>
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sLinkText`} label="Link Text" disableDefaultMaxLength />
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sSlug`} label="Slug" disableDefaultMaxLength />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

SpecializedImplementationSolutionsSection.propTypes = {
  basePath: PropTypes.string
}
