import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function FeaturedArticleSection({ basePath = 'oFCA', sectionLabel = 'Featured Article' }) {
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
    name: `${basePath}.aTags`
  })

  useEffect(() => {
    if (!fields.length) append('')
  }, [append, fields.length])

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <Row>
        <Col sm="8">
          <CountInput
            type="text"
            currentLength={values?.sSectionTitle?.length}
            register={register(`${basePath}.sSectionTitle`)}
            error={errors}
            name={`${basePath}.sSectionTitle`}
            label="Section Title"
          />
          <CountInput
            type="text"
            currentLength={values?.sHeadline?.length}
            register={register(`${basePath}.sHeadline`)}
            error={errors}
            name={`${basePath}.sHeadline`}
            label="Headline"
          />
          <CountInput
            textarea
            rows={6}
            currentLength={values?.sDescription?.length}
            register={register(`${basePath}.sDescription`)}
            error={errors}
            name={`${basePath}.sDescription`}
            label="Description"
          />
          <CountInput
            type="text"
            currentLength={values?.oCta?.sLabel?.length}
            register={register(`${basePath}.oCta.sLabel`)}
            error={errors}
            name={`${basePath}.oCta.sLabel`}
            label="Button Label"
          />
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            name={`${basePath}.oCta.sUrl`}
            label="Button Link"
            disableDefaultMaxLength
          />
        </Col>
        <Col sm="4" className="add-article">
          <ImageDimensionNote width={830} height={600} subject="featured article image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Featured Article Image"
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

      <Form.Label className="text-uppercase small text-muted mb-2 mt-3">Tags</Form.Label>
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append('')} variant="link" size="sm" className="square icon-btn">
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
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aTags[${index}]`} label={`Tag ${index + 1}`} />
        </InputArrayBox>
      ))}
    </div>
  )
}

FeaturedArticleSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string
}
