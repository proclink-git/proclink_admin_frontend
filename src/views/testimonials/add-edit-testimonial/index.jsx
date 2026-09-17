import React, { useContext } from 'react'
import { Button, Form, Col, Spinner, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import { useMutation, useQuery } from '@apollo/client'
import { useParams, useHistory } from 'react-router'

import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import VideoInput from 'shared/components/videoInput'
import { ADD_TESTIMONIAL, EDIT_TESTIMONIAL, GET_TESTIMONIAL_BY_ID } from 'graph-ql/testimonial/mutation'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypenameKey } from 'shared/utils'
import { ToastrContext } from 'shared/components/toastr'
import CountInput from 'shared/components/count-input'

function AddEditTestimonial() {
  const { id } = useParams()
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues,
    watch
  } = useForm({
    mode: 'all'
  })

  const value = getValues()

  const [AddTestimonial, { loading }] = useMutation(ADD_TESTIMONIAL, {
    onCompleted: (data) => {
      if (data && data?.addTestimonial) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addTestimonial.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.testimonials)
      }
    }
  })

  const [EditTestimonial, { loading: editLoading }] = useMutation(EDIT_TESTIMONIAL, {
    onCompleted: (data) => {
      if (data && data.editTestimonial) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editTestimonial.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.testimonials)
      }
    }
  })

  function onAddEditTestimonial(data) {
    if (id) {
      // const newData = { ...data, eStatus: data?.eStatus }
      EditTestimonial({ variables: { input: { ...data, _id: id } } })
    } else {
      AddTestimonial({ variables: { input: { ...data, eStatus: 'a' } } })
    }
  }

  useQuery(GET_TESTIMONIAL_BY_ID, {
    variables: { input: { _id: id } },
    skip: !id,
    onCompleted: (data) => {
      if (data?.getTestimonial?.oTestimonial) {
        const newData = removeTypenameKey(data?.getTestimonial?.oTestimonial)
        reset(newData)
      }
    }
  })

  return (
    <>
      <Form onSubmit={handleSubmit(onAddEditTestimonial)}>
        <Row>
          <Col sm="8">
            <Row>
              <Col>
                <CountInput
                  maxWord={40}
                  currentLength={value?.sTitle?.length}
                  placeholder={useIntl().formatMessage({ id: 'writeHere' })}
                  type="text"
                  register={register('sTitle', { maxLength: { value: 40, message: validationErrors.maxLength(40) } })}
                  error={errors}
                  className={errors.sTitle && 'error'}
                  name="sTitle"
                  label="Title*"
                />
                <CommonInput
                  placeholder={useIntl().formatMessage({ id: 'writeHere' })}
                  type="text"
                  register={register}
                  errors={errors}
                  className={errors.sClientName && 'error'}
                  name="sClientName"
                  label="Client Name"
                />
                <CommonInput
                  placeholder={useIntl().formatMessage({ id: 'writeHere' })}
                  type="textarea"
                  register={register}
                  errors={errors}
                  className={errors.sDescription && 'error'}
                  name="sDescription"
                  label="Description"
                />
                <VideoInput register={register} errors={errors} watch={watch} />
              </Col>
            </Row>
          </Col>
          <Col sm="4" className="add-article">
            <div className="sticky-column">
              <CategoryPlayerTeamImage
                galleryType="csi"
                name="oImg"
                register={register}
                setValue={setValue}
                // onDelete={handleDeleteImg}
                values={getValues()}
                errors={errors}
                title="Image"
                // imgUrl={categoryData?.oImg?.sUrl}
              />
            </div>
          </Col>
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="btn-bottom add-border mt-4">
              <Button variant="primary" type="submit" className="m-2">
                <FormattedMessage id={id ? 'update' : 'add'} />
                {(loading || editLoading) && <Spinner animation="border" size="sm" />}
              </Button>
            </div>
          </div>
        </Row>
      </Form>
    </>
  )
}

export default AddEditTestimonial
