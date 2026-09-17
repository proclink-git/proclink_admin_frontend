import React, { useEffect } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'

import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'

export default function FooterSocial() {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    getValues,
    clearErrors
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aSlink'
  })

  useEffect(() => {
    if (fields.length === 0) append({ sLink: null, eSocialNetworkType: null })
  }, [fields])

  return (
    <>
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button onClick={() => append({ sLink: null, sDisplayName: null })} variant="link" className="square icon-btn">
                  <i className="icon-add d-block" />
                </Button>
              )}
              {fields.length > 1 && (
                <Button onClick={() => remove(index)} variant="link" className="square icon-btn">
                  <i className="icon-delete d-block" />
                </Button>
              )}
            </>
          }
        >
          <Row>
            <Col sm="8">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={errors?.aSlink?.[index]?.sDisplayName && 'error'}
                name={`aSlink[${index}].sDisplayName`}
                label="Display Name*"
                displayClass="mb-0"
              />
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={errors?.aSlink?.[index]?.sLink && 'error'}
                name={`aSlink[${index}].sLink`}
                label="URL*"
                displayClass="mb-0"
              />
            </Col>
            <Col sm="4" className="add-article">
              <CategoryPlayerTeamImage
                galleryType="icon"
                name={`aSlink.[${index}].oIcon`}
                register={register}
                setValue={setValue}
                title="Icon"
                // onDelete={console.log}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                // imgUrl={reset}
                hideCaption
                hideAttribution
                required
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </>
  )
}
