import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultServiceListingCard } from './utils'
import useEnsureFieldArrayDefault from '../dynamic/use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

function ServiceListingAccordionCard({ basePath, index, canRemove, isLastCard, onRemoveCard, onAppendCard }) {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()

  const cardPath = `${basePath}.aCard[${index}]`
  const cardValues = watch(cardPath) || {}
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag
  } = useFieldArray({
    control,
    name: `${cardPath}.aTag`
  })

  return (
    <InputArrayBox
      className="mb-3"
      actions={
        <>
          {isLastCard && (
            <Button type="button" onClick={onAppendCard} variant="link" size="sm" className="square icon-btn">
              <i className="icon-add d-block" />
            </Button>
          )}
          {canRemove && (
            <Button type="button" onClick={onRemoveCard} variant="link" size="sm" className="square icon-btn">
              <i className="icon-delete d-block" />
            </Button>
          )}
        </>
      }
    >
      <Form.Label>Card {index + 1}</Form.Label>
      <Row className="g-4">
        <Col lg="7">
          <CountInput type="text" currentLength={cardValues?.sTitle?.length} register={register(`${cardPath}.sTitle`)} error={errors} name={`${cardPath}.sTitle`} label="Card Title*" />
          <CountInput textarea rows={6} currentLength={cardValues?.sDescription?.length} register={register(`${cardPath}.sDescription`)} error={errors} name={`${cardPath}.sDescription`} label="Description*" />
          <CountInput type="text" currentLength={cardValues?.oCta?.sLabel?.length} register={register(`${cardPath}.oCta.sLabel`)} error={errors} name={`${cardPath}.oCta.sLabel`} label="Button Label*" />
          <CommonInput type="text" register={register} errors={errors} name={`${cardPath}.oCta.sUrl`} label="Button Link*" disableDefaultMaxLength />

          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <Form.Label className="mb-0">Tags</Form.Label>
              <Button type="button" onClick={() => appendTag('')} variant="link" className="square add-media hover-none btn-sm p-0">
                <i className="icon-add" />
                Add Tag
              </Button>
            </div>
            {(tagFields || []).map((field, tagIndex) => (
              <CommonInput
                key={field.id}
                type="text"
                register={register}
                errors={errors}
                name={`${cardPath}.aTag[${tagIndex}]`}
                placeholder={`Tag ${tagIndex + 1}`}
                displayClass="mb-2"
                inputGroupRight={
                  tagFields.length > 1 ? (
                    <Button type="button" variant="link" className="icon-right" onClick={() => removeTag(tagIndex)}>
                      <i className="icon-delete"></i>
                    </Button>
                  ) : null
                }
              />
            ))}
          </div>
        </Col>
        <Col lg="5" className="add-article">
          <ImageDimensionNote width={238} height={270} subject="service listing accordion image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Primary Image*"
            name={`${cardPath}.oImgPrimary`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            hideAttribution
          />
          <div className="mt-3">
            <CategoryPlayerTeamImage
              galleryType="pb"
              title="Secondary Image*"
              name={`${cardPath}.oImgSecondary`}
              register={register}
              setValue={setValue}
              values={getValues()}
              errors={errors}
              clearErrors={clearErrors}
              hideAttribution
            />
          </div>
        </Col>
      </Row>
    </InputArrayBox>
  )
}

ServiceListingAccordionCard.propTypes = {
  basePath: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  canRemove: PropTypes.bool.isRequired,
  isLastCard: PropTypes.bool.isRequired,
  onRemoveCard: PropTypes.func.isRequired,
  onAppendCard: PropTypes.func.isRequired
}

export default function ServiceListingAccordionSection({ basePath = 'oServicePage.oSLA', sectionLabel = 'Service Listing Accordion' }) {
  const {
    control,
    register,
    watch,
    getValues,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}
  const fieldArrayName = `${basePath}.aCard`
  const {
    fields,
    append,
    remove
  } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultServiceListingCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title*" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description*" />

      {fields.map((field, index) => (
        <ServiceListingAccordionCard
          key={field.id}
          basePath={basePath}
          index={index}
          canRemove={fields.length > 1}
          isLastCard={index === fields.length - 1}
          onRemoveCard={() => remove(index)}
          onAppendCard={() => append(getDefaultServiceListingCard())}
        />
      ))}
    </div>
  )
}

ServiceListingAccordionSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string
}
