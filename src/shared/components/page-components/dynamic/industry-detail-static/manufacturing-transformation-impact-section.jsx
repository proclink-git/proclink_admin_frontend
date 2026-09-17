import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { isVideoMedia } from 'shared/utils'
import { getDefaultTransformationImpactCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

function MediaReferenceFields({ basePath, label, register, currentValue, currentType, setValue, clearErrors, getValues, errors }) {
  const normalizedCurrentType = currentType === 'v' ? 'v' : 'i'
  const previousMediaTypeRef = useRef(normalizedCurrentType)

  useEffect(() => {
    if (previousMediaTypeRef.current === normalizedCurrentType) return

    setValue(`${basePath}.sUrl`, '', { shouldDirty: true })
    setValue(`${basePath}.sMediaUrl`, '', { shouldDirty: true })
    setValue(`${basePath}.sText`, '', { shouldDirty: true })
    setValue(`${basePath}.sCaption`, '', { shouldDirty: true })
    setValue(`${basePath}.sAttribute`, '', { shouldDirty: true })
    clearErrors([basePath, `${basePath}.sUrl`, `${basePath}.sMediaUrl`])
    previousMediaTypeRef.current = normalizedCurrentType
  }, [basePath, clearErrors, normalizedCurrentType, setValue])

  useEffect(() => {
    const hasVideoInHiddenField = normalizedCurrentType === 'i' && currentValue && isVideoMedia(currentValue)

    if (!hasVideoInHiddenField) return

    setValue(`${basePath}.sUrl`, '', { shouldDirty: true })
    setValue(`${basePath}.sText`, '', { shouldDirty: true })
    setValue(`${basePath}.sCaption`, '', { shouldDirty: true })
    setValue(`${basePath}.sAttribute`, '', { shouldDirty: true })
    setValue(`${basePath}.sMediaUrl`, '', { shouldDirty: true })
    clearErrors([basePath, `${basePath}.sUrl`, `${basePath}.sMediaUrl`])
  }, [basePath, clearErrors, currentValue, normalizedCurrentType, setValue])

  return (
    <InputArrayBox className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Group className="form-group">
        <Form.Label>Media Type</Form.Label>
        <Form.Select {...register(`${basePath}.eMediaType`)}>
          <option value="i">Image</option>
          <option value="v">Video</option>
        </Form.Select>
      </Form.Group>
      <input type="hidden" {...register(`${basePath}.sMediaUrl`)} />
      <div className="add-article">
        <CategoryPlayerTeamImage
          key={`${basePath}-media-${normalizedCurrentType}`}
          galleryType="pb"
          title={normalizedCurrentType === 'v' ? 'Featured Video' : 'Featured Image'}
          name={basePath}
          register={register}
          setValue={setValue}
          onDelete={() => setValue(`${basePath}.sMediaUrl`, '')}
          urlFieldName={`${basePath}.sMediaUrl`}
          values={getValues()}
          errors={errors}
          clearErrors={clearErrors}
          hideText
          hideCaption
          hideAttribution
          mediaType={normalizedCurrentType === 'v' ? 'video' : 'image'}
        />
      </div>
    </InputArrayBox>
  )
}

MediaReferenceFields.propTypes = {
  basePath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  currentValue: PropTypes.string,
  currentType: PropTypes.string,
  setValue: PropTypes.func.isRequired,
  clearErrors: PropTypes.func,
  getValues: PropTypes.func.isRequired,
  errors: PropTypes.object
}

export default function ManufacturingTransformationImpactSection({ basePath = 'oMTI' }) {
  const {
    register,
    control,
    setValue,
    getValues,
    clearErrors,
    watch,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  const fieldArrayName = `${basePath}.aCard`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultTransformationImpactCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Manufacturing Transformation Impact</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <Row>
          <ImageDimensionNote width={430} height={520} subject="manufacturing transformation impact image" />
        <Col md="6">
          <MediaReferenceFields
            basePath={`${basePath}.oTopLeft`}
            label="Top Left Media"
            register={register}
            currentValue={values?.oTopLeft?.sMediaUrl}
            currentType={values?.oTopLeft?.eMediaType}
            setValue={setValue}
            getValues={getValues}
            clearErrors={clearErrors}
            errors={errors}
          />
        </Col>
        <Col md="6">
          <MediaReferenceFields
            basePath={`${basePath}.oBottomRight`}
            label="Bottom Right Media"
            register={register}
            currentValue={values?.oBottomRight?.sMediaUrl}
            currentType={values?.oBottomRight?.eMediaType}
            setValue={setValue}
            getValues={getValues}
            clearErrors={clearErrors}
            errors={errors}
          />
        </Col>
      </Row>

      <Form.Label className="text-uppercase small text-muted mb-2">Impact Cards</Form.Label>

      <Row>
        {fields.map((field, index) => (
          <Col md="6" key={field.id}>
            <InputArrayBox
              className="mb-3"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button type="button" onClick={() => append(getDefaultTransformationImpactCard())} variant="link" size="sm" className="square icon-btn">
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
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                name={`${basePath}.aCard[${index}].sNumber`}
                label="Number"
                disableDefaultMaxLength
              />
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Title" />
            </InputArrayBox>
          </Col>
        ))}
      </Row>
    </div>
  )
}

ManufacturingTransformationImpactSection.propTypes = {
  basePath: PropTypes.string
}
