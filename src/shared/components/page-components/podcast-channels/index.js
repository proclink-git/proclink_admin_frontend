/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useHistory } from 'react-router'
import { ToastrContext } from 'shared/components/toastr'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { GET_PAGE_COMPONENT } from 'graph-ql/page-components/query'
import { useMutation, useQuery } from '@apollo/client'
import { allRoutes } from 'shared/constants/AllRoutes'
import { EDIT_PAGE_COMPONENT } from 'graph-ql/page-components/mutation'
import { AMAZON_MUSIC_URL_REGEX, GOOGLE_PODCAST_URL_REGEX, POBDEAN_URL_REGEX, PODCAST_PLATFORM_TYPE, SOUND_CLOUD_URL_REGEX, SPOTIFY_URL_REGEX, TOAST_TYPE, URL_REGEX } from 'shared/constants'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import InputArrayBox from 'shared/components/input-array-box'
import { getPodcastPlatformType } from 'shared/components/article-add-edit-components/podcast-fields'
import Select from 'react-select'
import CommonInput from 'shared/components/common-input'
import { FormattedMessage } from 'react-intl'
import { validationErrors } from 'shared/constants/ValidationErrors'

export default function PodcastChannels() {
  const { eType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isValid }
  } = useForm({
    mode: 'all',
    defaultValues: {
      oComponentInput: {
        aValue: [getDefaultValues()]
      }
    }
  })

  function getDefaultValues() {
    return [{ ePlatform: '', sLink: '' }]
  }

  useQuery(GET_PAGE_COMPONENT, {
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.getComponent?.oComponent) {
        const d = data?.getComponent?.oComponent
        // reset({
        //   oComponentInput: {
        //     aPodcast: d?.aPodcast
        //   }
        // })
        setComponentData(d)
      }
    }
  })

  function setComponentData(data) {
    const oData = {}
    const aPodcast = data?.aPodcast?.map((e) => ({
      ePlatform: PODCAST_PLATFORM_TYPE.find((p) => p.value === e.ePlatform),
      sLink: e.sLink
    }))
    oData.aPodcast = aPodcast
    reset({
      oComponentInput: {
        aPodcast: oData?.aPodcast
      }
    })
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oComponentInput.aPodcast'
  })

  const [edit, { loading }] = useMutation(EDIT_PAGE_COMPONENT, {
    onCompleted: (data) => {
      if (data?.editComponent) {
        history.push(allRoutes.pageComponents)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.editComponent?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function getPodcastUrlRegex(ePlatform) {
    switch (ePlatform) {
      case 'sf':
        return SPOTIFY_URL_REGEX
      case 'am':
        return AMAZON_MUSIC_URL_REGEX
      case 'gp':
        return GOOGLE_PODCAST_URL_REGEX
      case 'sc':
        return SOUND_CLOUD_URL_REGEX
      case 'pb':
        return POBDEAN_URL_REGEX
      default:
        return URL_REGEX
    }
  }

  function onSubmit(d) {
    d.oComponentInput.aPodcast = d?.oComponentInput?.aPodcast?.map((e) => ({
      ePlatform: e.ePlatform.value,
      sLink: e.sLink
    }))
    edit({ variables: { input: d } })
  }

  useEffect(() => {
    if (fields.length === 0) append({ ePlatform: '', sLink: '' })
  }, [fields])

  return (
        <>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('eType')} value={eType} />
                {fields.map((field, index) => (
                    <InputArrayBox
                        key={field.id}
                        className="mb-3"
                        actions={
                            <>
                                {index + 1 === fields.length && fields.length < PODCAST_PLATFORM_TYPE?.length && (
                                    <Button onClick={() => append(getPodcastPlatformType())} variant="link" size="sm" className="square icon-btn">
                                        <i className="icon-add d-block" />
                                    </Button>
                                )}
                                {fields.length > 1 && (
                                    <Button onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                                        <i className="icon-delete d-block" />
                                    </Button>
                                )}
                            </>
                        }
                    >
                        <Row>
                            <Col md="6">
                                <Form.Group className="form-group mb-0">
                                    <Form.Label>Select Platform</Form.Label>
                                    <i className="icon-chevron-down"></i>
                                    <Controller
                                        name={`oComponentInput.aPodcast[${index}].ePlatform`}
                                        control={control}
                                        render={({ field: { onChange, value, ref } }) => (
                                            <Select
                                                ref={ref}
                                                value={value || null}
                                                options={PODCAST_PLATFORM_TYPE}
                                                className="react-select"
                                                classNamePrefix="select"
                                                isSearchable={false}
                                                onChange={onChange}
                                            />
                                        )}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md="6">
                                <CommonInput
                                    type="text"
                                    register={register}
                                    errors={errors}
                                    className={errors?.oPodcast?.aPlatform?.[index]?.sLink && 'error'}
                                    name={`oComponentInput.aPodcast[${index}].sLink`}
                                    label="URL"
                                    validation={{
                                        pattern: {
                                            value: getPodcastUrlRegex(watch(`oComponentInput.aPodcast[${index}].ePlatform.value`)),
                                            message: validationErrors.url
                                        }
                                    }}
                                    displayClass="mb-0"
                                    required
                                />
                            </Col>
                        </Row>
                    </InputArrayBox>
                ))}
                <Button variant="primary" type="submit" className="m-2" disabled={!isValid || loading}>
                    <FormattedMessage id="update" />
                    {loading && <Spinner animation="border" size="sm" />}
                </Button>
            </Form>
        </>
  )
}
