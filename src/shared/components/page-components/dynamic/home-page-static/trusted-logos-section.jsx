import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { getDefaultLogo } from './utils'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function TrustedLogosSection({
  basePath = 'oHomePage.oTL',
  sectionLabel = 'Trusted Logos',
  itemLabel = 'Logo',
  showRedirectUrl = false,
  redirectLabel = 'Redirect Url'
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
    name: `${basePath}.aLogo`
  })

  useEffect(() => {
    if (fields.length === 0) {
      append(getDefaultLogo())
    }
  }, [append, fields.length])

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <Row>
        <Col sm="8">
          <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title*" />
        <ImageDimensionNote width={100} height={100} subject="trusted logos image" />
        </Col>
      </Row>

      <Row className="gutter-9">
        {fields.map((field, index) => (
          <Col sm="4" key={field.id} className="add-article mb-3">
            <InputArrayBox
              className="h-100"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button type="button" onClick={() => append(getDefaultLogo())} variant="link" size="sm" className="square icon-btn">
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
              <Form.Label>
                {itemLabel} {index + 1}
              </Form.Label>
              <CategoryPlayerTeamImage
                galleryType="mrlogo"
                title={`${itemLabel} ${index + 1}*`}
                name={`${basePath}.aLogo[${index}].oImg`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
              {showRedirectUrl && (
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  name={`${basePath}.aLogo[${index}].sRedirectUrl`}
                  label={redirectLabel}
                  disableDefaultMaxLength
                />
              )}
            </InputArrayBox>
          </Col>
        ))}
      </Row>
    </div>
  )
}

TrustedLogosSection.propTypes = {
  basePath: PropTypes.string,
  redirectLabel: PropTypes.string,
  sectionLabel: PropTypes.string,
  itemLabel: PropTypes.string,
  showRedirectUrl: PropTypes.bool
}
