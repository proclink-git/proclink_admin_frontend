import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultIndustryHeroCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function IndustryHeroSection({ basePath = 'oIndustryPage.oIHC' }) {
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
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultIndustryHeroCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Industry Hero</Form.Label>

      <Row>
        <Col lg="8">
          <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Hero Title*" />
          <TitleFormatHint subject="hero title" />
          <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Hero Description*" />
          <CountInput type="text" currentLength={values?.sImageTitle?.length} register={register(`${basePath}.sImageTitle`)} error={errors} name={`${basePath}.sImageTitle`} label="Image Title*" />
        </Col>
        <Col lg="4" className="add-article">
          <ImageDimensionNote width={1920} height={1040} subject="industry hero image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Hero Image*"
            name={`${basePath}.oImg`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            hideAttribution
          />
        </Col>
      </Row>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultIndustryHeroCard())} variant="link" size="sm" className="square icon-btn">
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
            <Col sm="8">
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Card Title*" />
              <CountInput textarea rows={6} currentLength={values?.aCard?.[index]?.sDescription?.length} register={register(`${basePath}.aCard[${index}].sDescription`)} error={errors} name={`${basePath}.aCard[${index}].sDescription`} label="Description*" />
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sRedirectUrl`} label="Redirect Url" disableDefaultMaxLength />
              <input type="hidden" value="_self" {...register(`${basePath}.aCard[${index}].eTarget`)} />
            </Col>
            <Col sm="4" className="add-article">
              <ImageDimensionNote width={240} height={240} subject="industry hero card image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Image*"
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

IndustryHeroSection.propTypes = {
  basePath: PropTypes.string
}
