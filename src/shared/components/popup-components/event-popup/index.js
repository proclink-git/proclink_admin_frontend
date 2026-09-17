import React, { forwardRef } from 'react'
import { Col, Form, InputGroup, Row } from 'react-bootstrap'
import { Controller, useFormContext } from 'react-hook-form'
import DatePicker from 'react-datepicker'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { URL_PREFIX, URL_REGEX } from 'shared/constants'

export default function EventPopup() {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    getValues,
    control
  } = useFormContext()
  return (
    <Row>
      <Col sm={8}>
        <Row>
          <Col md={6}>
            <Form.Group className="form-group">
              <Form.Label className="d-block">Event Date*</Form.Label>
              <Controller
                name="oEventPopup.dEventDate"
                control={control}
                rules={{ required: validationErrors.required }}
                render={({ field: { onChange, value = '' } }) => (
                  <DatePicker
                    selected={value}
                    dateFormat="dd-MM-yyyy h:mm aa"
                    minDate={new Date()}
                    onChange={onChange}
                    showTimeSelect
                    timeIntervals={15}
                    withPortal
                    customInput={<ExampleCustomInput icon="visibility" error={errors?.oEventPopup?.dEventDate} />}
                  />
                )}
              />
              {errors?.oEventPopup?.dEventDate && (
                <Form.Control.Feedback type="invalid">{errors?.oEventPopup?.dEventDate?.message}</Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oEventPopup?.sTitle && 'error'}
              name="oEventPopup.sTitle"
              label="Event Title"
              placeholder="Event"
              required
              validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
            />
          </Col>
        </Row>
        <CommonInput
          type="text"
          register={register}
          errors={errors}
          className={errors?.oEventPopup?.sHeading && 'error'}
          name="oEventPopup.sHeading"
          label="Event Heading"
          placeholder="Proclink Exhibited at 2024 Multi-unit Franchising Conference in Las Vegas"
          required
          validation={{ maxLength: { value: 300, message: validationErrors.maxLength(300) } }}
        />
        <CommonInput
          type="textarea"
          register={register}
          errors={errors}
          className={errors?.oEventPopup?.sSupportingLine && 'error'}
          name="oEventPopup.sSupportingLine"
          label="Event Supporting Line"
          placeholder="Proclink Accounting & Business Services was a prominent exhibitor at 2024 Multi-unit Franchising Conference in Las Vegas, a four-day event for multi-unit and multi-brand...."
          required
          validation={{ maxLength: { value: 900, message: validationErrors.maxLength(900) } }}
        />
        <Row>
          <Col md={6}>
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oEventPopup?.sCTAText && 'error'}
              name="oEventPopup.sCTAText"
              label="Button Text"
              placeholder="Read More"
              validation={{ maxLength: { value: 25, message: validationErrors.maxLength(25) } }}
              required
            />
          </Col>
          <Col md={6}>
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oEventPopup?.sCTALink && 'error'}
              name="oEventPopup.sCTALink"
              label="Button Link"
              placeholder={URL_PREFIX}
              validation={{ pattern: { value: URL_REGEX, message: validationErrors.url } }}
              required
            />
          </Col>
        </Row>
      </Col>
      <Col sm={4} className="add-article">
        <CategoryPlayerTeamImage
          galleryType="pub"
          title="Event Image"
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
// eslint-disable-next-line react/prop-types
const ExampleCustomInput = forwardRef(({ value, onClick, icon, error }, ref) => (
  <InputGroup>
    <Form.Control value={value} type="text" ref={ref} onClick={onClick} className={error && 'error'} readOnly />
  </InputGroup>
))
ExampleCustomInput.displayName = ExampleCustomInput
