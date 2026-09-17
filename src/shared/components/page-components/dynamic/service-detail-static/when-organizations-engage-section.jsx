import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import EditorNote from 'shared/components/editor-note'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultServiceFeatureCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function WhenOrganizationsEngageSection({ basePath = 'oWOE' }) {
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

  const fieldArrayName = `${basePath}.aFeature`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultServiceFeatureCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">When Organizations Engage Implementation Services</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={5} currentLength={values?.sSubtitle?.length} register={register(`${basePath}.sSubtitle`)} error={errors} name={`${basePath}.sSubtitle`} label="Subtitle" />

      <Form.Label className="text-uppercase small text-muted mb-2">Feature Cards</Form.Label>
      <EditorNote title="Design Note">For better design, keep only 5 feature cards in this section.</EditorNote>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button
                  type="button"
                  onClick={() => append(getDefaultServiceFeatureCard())}
                  variant="link"
                  size="sm"
                  className="square icon-btn"
                >
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
          <Form.Label>Feature {index + 1}</Form.Label>
          <Row>
            <Col md="8">
              <CountInput type="text" currentLength={values?.aFeature?.[index]?.sTitle?.length} register={register(`${basePath}.aFeature[${index}].sTitle`)} error={errors} name={`${basePath}.aFeature[${index}].sTitle`} label="Title" />
              <CountInput textarea rows={6} currentLength={values?.aFeature?.[index]?.sDescription?.length} register={register(`${basePath}.aFeature[${index}].sDescription`)} error={errors} name={`${basePath}.aFeature[${index}].sDescription`} label="Description" />
            </Col>
            <Col md="4" className="add-article">
              <ImageDimensionNote width={32} height={32} subject="icon" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Icon"
                name={`${basePath}.aFeature[${index}].oIcon`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

WhenOrganizationsEngageSection.propTypes = {
  basePath: PropTypes.string
}
