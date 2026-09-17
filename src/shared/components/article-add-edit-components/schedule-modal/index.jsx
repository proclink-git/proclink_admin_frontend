import React, { forwardRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Dropdown, Form, InputGroup, Modal } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import { Controller, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'
import { validationErrors } from 'shared/constants/ValidationErrors'
import moment from 'moment'
import { compareDateToCurrentDate, filterPassedTime } from 'shared/utils'

function ScheduleModal({ articleSubmit, formSubmit, setValue, defaultValue }) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({ mode: 'all', defaultValues: {} })

  function handleHideShow() {
    setIsOpen(!isOpen)
  }

  function onSubmit(data) {
    setValue('dPublishDate', moment.utc(data.dateTime).format())
    articleSubmit((d) => formSubmit(d, 's', 'ct'))()
    handleHideShow()
    reset()
  }
  // eslint-disable-next-line react/prop-types
  const ExampleCustomInput = forwardRef(({ value, onClick, icon, error }, ref) => (
    <InputGroup>
      <Form.Control value={value} type="text" ref={ref} onClick={onClick} className={error && 'error'} readOnly />
      <i className={`icon-right btn btn-link icon-${icon} hover-none`}></i>
    </InputGroup>
  ))
  ExampleCustomInput.displayName = ExampleCustomInput

  return (
    <>
      <Dropdown.Item onClick={handleHideShow}>
        <FormattedMessage id="schedule" />
      </Dropdown.Item>
      <Modal show={isOpen} onHide={handleHideShow} centered>
        <Modal.Body>
          <h4 className="mb-3">
            <FormattedMessage id="scheduleTimeDate" />
          </h4>
          <Form>
            <Form.Group className="form-group">
              <Form.Label className="d-block">
                <FormattedMessage id="dateAndTime" />
              </Form.Label>
              <Controller
                name="dateTime"
                control={control}
                rules={{ required: validationErrors.required }}
                defaultValue={defaultValue || new Date(moment().add(30, 'minute').format())}
                render={({ field: { onChange, value = '' } }) => (
                  <>
                    <DatePicker
                      selected={value}
                      dateFormat="dd-MM-yyyy h:mm aa"
                      minDate={new Date()}
                      filterTime={filterPassedTime}
                      onChange={(date) => {
                        if (compareDateToCurrentDate(date)) {
                          onChange(new Date(moment().add(30, 'minute').format()))
                        } else {
                          onChange(date)
                        }
                      }}
                      showTimeSelect
                      timeIntervals={15}
                      customInput={<ExampleCustomInput icon="visibility" error={errors.date} />}
                    />
                  </>
                )}
              />
              {errors.date && <Form.Control.Feedback type="invalid">{errors.date.message}</Form.Control.Feedback>}
            </Form.Group>
            <div>
              <Button size="sm" variant="primary" onClick={handleSubmit(onSubmit)}>
                <FormattedMessage id="schedule" />
              </Button>
              <Button variant="outline-secondary" onClick={handleHideShow} size="sm" className="ms-2">
                <FormattedMessage id="cancel" />
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}
ScheduleModal.propTypes = {
  articleSubmit: PropTypes.func,
  formSubmit: PropTypes.func,
  setValue: PropTypes.func,
  defaultValue: PropTypes.string
}
export default ScheduleModal
