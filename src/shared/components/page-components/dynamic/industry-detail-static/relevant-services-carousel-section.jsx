import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultRelevantServiceCard } from './utils'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function RelevantServicesCarouselSection({
  basePath = 'oRSC',
  sectionLabel = 'Relevant Services Carousel',
  cardsLabel = 'Service Cards'
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aCard`
  })

  useEffect(() => {
    if (fields.length === 0) {
      append(getDefaultRelevantServiceCard())
    }
  }, [append, fields.length])

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <Form.Label className="text-uppercase small text-muted mb-2">{cardsLabel}</Form.Label>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultRelevantServiceCard())} variant="link" size="sm" className="square icon-btn">
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
              <ImageDimensionNote width={550} height={696} subject="relevant services carousel image" />
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
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sRedirectUrl`} label="Redirect Url" disableDefaultMaxLength />
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sSlug`} label="Slug" disableDefaultMaxLength />
              <input type="hidden" value="_self" {...register(`${basePath}.aCard[${index}].eTarget`)} />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

RelevantServicesCarouselSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  cardsLabel: PropTypes.string
}
