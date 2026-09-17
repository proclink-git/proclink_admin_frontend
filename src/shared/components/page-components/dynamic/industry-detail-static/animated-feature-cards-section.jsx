import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import EditorNote from 'shared/components/editor-note'
import InputArrayBox from 'shared/components/input-array-box'
import { getDefaultAnimatedFeatureCard } from './utils'
import TitleFormatHint from 'shared/components/title-format-hint'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function AnimatedFeatureCardsSection({
  basePath = 'oAFC',
  sectionLabel = 'Animated Feature Cards',
  cardsLabel = 'Feature Cards',
  showSectionDescription = true,
  showSlug = false,
  showRedirectUrl = false,
  redirectUrlLabel = 'Redirect Url',
  showCardsDesignNote = true,
  imageWidth = 78,
  imageHeight = 78,
  imageDimensionSubject = 'animated feature cards image'
}) {
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
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultAnimatedFeatureCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      {showSectionDescription && (
        <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />
      )}

      <Form.Label className="text-uppercase small text-muted mb-2">{cardsLabel}</Form.Label>
      {showCardsDesignNote && <EditorNote title="Design Note">For proper design, keep 6 cards in this section.</EditorNote>}

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultAnimatedFeatureCard())} variant="link" size="sm" className="square icon-btn">
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
            <Col md="8">
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Title" />
              <CountInput textarea rows={6} currentLength={values?.aCard?.[index]?.sDescription?.length} register={register(`${basePath}.aCard[${index}].sDescription`)} error={errors} name={`${basePath}.aCard[${index}].sDescription`} label="Description" />
              {showSlug && <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sSlug`} label="Slug" disableDefaultMaxLength />}
              {showRedirectUrl && <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sRedirectUrl`} label={redirectUrlLabel} disableDefaultMaxLength />}
            </Col>
            <Col md="4" className="add-article">
              <ImageDimensionNote width={imageWidth} height={imageHeight} subject={imageDimensionSubject} />
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
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

AnimatedFeatureCardsSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  cardsLabel: PropTypes.string,
  showSectionDescription: PropTypes.bool,
  showSlug: PropTypes.bool,
  showRedirectUrl: PropTypes.bool,
  redirectUrlLabel: PropTypes.string,
  showCardsDesignNote: PropTypes.bool,
  imageWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  imageHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  imageDimensionSubject: PropTypes.string
}
