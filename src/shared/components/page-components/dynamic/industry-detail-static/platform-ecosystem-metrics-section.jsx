import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultMarqueeLogo, getDefaultMetricCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function PlatformEcosystemMetricsSection({
  basePath = 'oPEM',
  sectionLabel = 'Platform Ecosystem Metrics',
  cardsLabel = 'Metric Cards',
  marqueeLabel = 'Marquee Logos'
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

  const cardFieldArrayName = `${basePath}.aCard`
  const {
    fields: cardFields,
    append: appendCard,
    remove: removeCard
  } = useFieldArray({
    control,
    name: cardFieldArrayName
  })

  const marqueeFieldArrayName = `${basePath}.aMarquee`
  const { fields: marqueeFields, append: appendMarquee, remove: removeMarquee } = useFieldArray({
    control,
    name: marqueeFieldArrayName
  })

  useEnsureFieldArrayDefault({ fields: cardFields, append: appendCard, getValues, name: cardFieldArrayName, getDefaultValue: getDefaultMetricCard })
  useEnsureFieldArrayDefault({ fields: marqueeFields, append: appendMarquee, getValues, name: marqueeFieldArrayName, getDefaultValue: getDefaultMarqueeLogo })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <Form.Group className="form-group">
        <Form.Check type="switch" label="Enable Marquee" {...register(`${basePath}.bIsMarquee`)} />
      </Form.Group>

      <Form.Label className="text-uppercase small text-muted mb-2">{cardsLabel}</Form.Label>

      <Row>
        {cardFields.map((field, index) => (
          <Col md="6" key={field.id}>
            <InputArrayBox
              className="mb-3"
              actions={
                <>
                  {index + 1 === cardFields.length && (
                    <Button type="button" onClick={() => appendCard(getDefaultMetricCard())} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-add d-block" />
                    </Button>
                  )}
                  {cardFields.length > 1 && (
                    <Button type="button" onClick={() => removeCard(index)} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-delete d-block" />
                    </Button>
                  )}
                </>
              }
            >
              <Form.Label>Card {index + 1}</Form.Label>
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sLabel`} label="Label" disableDefaultMaxLength />
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sValue`} label="Value" disableDefaultMaxLength />
            </InputArrayBox>
          </Col>
        ))}
      </Row>

      {values?.bIsMarquee && (
        <>
          <Form.Label className="text-uppercase small text-muted mb-2">{marqueeLabel}</Form.Label>

          <Row className="gutter-9">
            <ImageDimensionNote width={120} height={46} subject="platform ecosystem metrics logo" />
            {marqueeFields.map((field, index) => (
              <Col md="4" key={field.id} className="add-article mb-3">
                <InputArrayBox
                  className="h-100"
                  actions={
                    <>
                      {index + 1 === marqueeFields.length && (
                        <Button type="button" onClick={() => appendMarquee(getDefaultMarqueeLogo())} variant="link" size="sm" className="square icon-btn">
                          <i className="icon-add d-block" />
                        </Button>
                      )}
                      {marqueeFields.length > 1 && (
                        <Button type="button" onClick={() => removeMarquee(index)} variant="link" size="sm" className="square icon-btn">
                          <i className="icon-delete d-block" />
                        </Button>
                      )}
                    </>
                  }
                >
                  <Form.Label>Logo {index + 1}</Form.Label>
                  <CategoryPlayerTeamImage
                    galleryType="mrlogo"
                    title={`Logo ${index + 1}`}
                    name={`${basePath}.aMarquee[${index}].oImg`}
                    register={register}
                    setValue={setValue}
                    values={getValues()}
                    errors={errors}
                    clearErrors={clearErrors}
                    hideAttribution
                  />
                </InputArrayBox>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  )
}

PlatformEcosystemMetricsSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  cardsLabel: PropTypes.string,
  marqueeLabel: PropTypes.string
}
