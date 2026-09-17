import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'

export default function ExitPopup() {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    getValues
  } = useFormContext()

  return (
    <Row>
      <Col sm={8}>
        <CommonInput
          type="text"
          register={register}
          errors={errors}
          className={errors?.oExitIntentPopup?.sHeading && 'error'}
          name="oExitIntentPopup.sHeading"
          label="Heading"
          placeholder="Get 50% Off"
          required
          validation={{ maxLength: { value: 300, message: validationErrors.maxLength(300) } }}
        />
        <CommonInput
          type="textarea"
          register={register}
          errors={errors}
          className={errors?.oExitIntentPopup?.sSupportingLine && 'error'}
          name="oExitIntentPopup.sSupportingLine"
          label="Supporting Line"
          placeholder="Limited time offer!"
          required
          validation={{ maxLength: { value: 900, message: validationErrors.maxLength(900) } }}
        />
        <CommonInput
          type="text"
          register={register}
          errors={errors}
          className={errors?.oExitIntentPopup?.sCTAText && 'error'}
          name="oExitIntentPopup.sCTAText"
          label="Button Text"
          placeholder="Let's Talk"
          validation={{ maxLength: { value: 25, message: validationErrors.maxLength(25) } }}
          required
        />
      </Col>
      <Col sm={4} className="add-article">
        <CategoryPlayerTeamImage
          galleryType="ep"
          title="Image"
          name="oBannerImage"
          register={register}
          setValue={setValue}
          values={getValues()}
          errors={errors}
          clearErrors={clearErrors}
          hideCaption
          hideAttribution
          required
        />
      </Col>
    </Row>
  )
}
