import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultContentShowcaseCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function ContentShowcaseSection({
  basePath = 'oCSC',
  sectionLabel = 'Content Showcase',
  cardsLabel = 'Content Cards'
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
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultContentShowcaseCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <div className="add-article mb-3">
        <ImageDimensionNote width={838} height={600} subject="content showcase image" />
        <CategoryPlayerTeamImage
          galleryType="pb"
          title="Featured Image"
          name={`${basePath}.oImg`}
          register={register}
          setValue={setValue}
          values={getValues()}
          errors={errors}
          clearErrors={clearErrors}
          hideAttribution
        />
      </div>

      <Form.Label className="text-uppercase small text-muted mb-2">{cardsLabel}</Form.Label>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultContentShowcaseCard())} variant="link" size="sm" className="square icon-btn">
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
            <Col md="6">
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sBadge?.length} register={register(`${basePath}.aCard[${index}].sBadge`)} error={errors} name={`${basePath}.aCard[${index}].sBadge`} label="Badge" />
            </Col>
            <Col md="6">
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sMeta?.length} register={register(`${basePath}.aCard[${index}].sMeta`)} error={errors} name={`${basePath}.aCard[${index}].sMeta`} label="Meta" />
            </Col>
          </Row>
          <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Card Title" />
          <CountInput textarea rows={5} currentLength={values?.aCard?.[index]?.sDescription?.length} register={register(`${basePath}.aCard[${index}].sDescription`)} error={errors} name={`${basePath}.aCard[${index}].sDescription`} label="Card Description" />
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sRedirectUrl`} label="Redirect Url" disableDefaultMaxLength />
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sSlug`} label="Slug" disableDefaultMaxLength />
          <input type="hidden" value="_self" {...register(`${basePath}.aCard[${index}].eTarget`)} />
        </InputArrayBox>
      ))}
    </div>
  )
}

ContentShowcaseSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  cardsLabel: PropTypes.string
}
