import React, { useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import { EDIT_PAGE_COMPONENT } from 'graph-ql/page-components/mutation'
import { GET_PAGE_COMPONENT } from 'graph-ql/page-components/query'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { removeTypenameKey } from 'shared/utils'
import { normalizeSectorScrollPayload } from 'shared/components/page-components/registry'

function getDefaultSector() {
  return {
    sTitle: '',
    sSlug: '',
    sDescription: '',
    sMediaUrl: '',
    eMediaType: 'i',
    oMedia: {
      sUrl: '',
      sText: '',
      sCaption: '',
      sAttribute: ''
    }
  }
}

function getDefaultSectors() {
  return Array.from({ length: 5 }, () => getDefaultSector())
}

function normalizeMedia(value = {}) {
  return {
    sUrl: value?.sUrl || '',
    sText: value?.sText || '',
    sCaption: value?.sCaption || '',
    sAttribute: value?.sAttribute || ''
  }
}

function normalizeSectorMediaType(value = '') {
  if (value === 'v' || value === 'video') return 'v'
  return 'i'
}

function normalizeSectorForForm(sector = {}) {
  const mediaUrl = sector?.sMediaUrl || sector?.oMedia?.sUrl || sector?.oImg?.sUrl || sector?.sUrl || ''

  return {
    ...getDefaultSector(),
    ...sector,
    sMediaUrl: mediaUrl,
    eMediaType: normalizeSectorMediaType(sector?.eMediaType),
    oMedia: {
      ...normalizeMedia(sector?.oMedia || sector?.oImg),
      sUrl: mediaUrl
    }
  }
}

function normalizeSectorsForForm(sectors) {
  const nextSectors = (Array.isArray(sectors) ? sectors : []).map((sector) => normalizeSectorForForm(removeTypenameKey(sector)))
  return nextSectors.length ? nextSectors : getDefaultSectors()
}

export default function SectorScroll() {
  const { eType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    clearErrors,
    control,
    formState: { errors }
  } = useForm({
    mode: 'all',
    defaultValues: {
      oComponentInput: {
        sComponentTitle: '',
        sMainDescription: '',
        aSector: getDefaultSectors()
      }
    }
  })

  const value = watch()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oComponentInput.aSector'
  })

  useQuery(GET_PAGE_COMPONENT, {
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.getComponent?.oComponent) {
        const component = data?.getComponent?.oComponent
        reset({
          oComponentInput: {
            sComponentTitle: component?.sComponentTitle || '',
            sMainDescription: component?.sMainDescription || '',
            aSector: normalizeSectorsForForm(component?.aSector)
          }
        })
      }
    }
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

  function onSubmit(data) {
    edit({
      variables: {
        input: {
          ...data,
          oComponentInput: normalizeSectorScrollPayload(data?.oComponentInput)
        }
      }
    })
  }

  function handleMediaTypeChange(index, mediaType) {
    const sectorPath = `oComponentInput.aSector[${index}]`

    setValue(`${sectorPath}.eMediaType`, mediaType, { shouldDirty: true })
    setValue(`${sectorPath}.sMediaUrl`, '', { shouldDirty: true })
    setValue(`${sectorPath}.oMedia`, normalizeMedia(), { shouldDirty: true })
    clearErrors([`${sectorPath}.sMediaUrl`, `${sectorPath}.oMedia`])
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register('eType')} value={eType} />
      <CountInput
        type="textarea"
        textarea
        rows={6}
        currentLength={value?.oComponentInput?.sMainDescription?.length}
        register={register('oComponentInput.sMainDescription', {
          required: validationErrors.required
        })}
        error={errors}
        className={errors?.oComponentInput?.sMainDescription && 'error'}
        name="oComponentInput.sMainDescription"
        label="Main Description*"
      />

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          actions={
            <>
              {index + 1 === fields.length && (
                <Button onClick={() => append(getDefaultSector())} variant="link" size="sm" className="square icon-btn">
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
          <Form.Label>Sector {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput
                type="text"
                currentLength={value?.oComponentInput?.aSector?.[index]?.sTitle?.length}
                register={register(`oComponentInput.aSector[${index}].sTitle`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aSector?.[index]?.sTitle && 'error'}
                name={`oComponentInput.aSector[${index}].sTitle`}
                label="Title*"
              />
              <CountInput
                type="text"
                currentLength={value?.oComponentInput?.aSector?.[index]?.sSlug?.length}
                register={register(`oComponentInput.aSector[${index}].sSlug`)}
                error={errors}
                className={errors?.oComponentInput?.aSector?.[index]?.sSlug && 'error'}
                name={`oComponentInput.aSector[${index}].sSlug`}
                label="Slug"
              />
              <CountInput
                type="textarea"
                textarea
                rows={6}
                currentLength={value?.oComponentInput?.aSector?.[index]?.sDescription?.length}
                register={register(`oComponentInput.aSector[${index}].sDescription`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aSector?.[index]?.sDescription && 'error'}
                name={`oComponentInput.aSector[${index}].sDescription`}
                label="Description*"
              />
            </Col>
            <Col sm="4" className="add-article">
              <Form.Group className="form-group">
                <Form.Label>Media Type</Form.Label>
                <Form.Select
                  {...register(`oComponentInput.aSector[${index}].eMediaType`)}
                  onChange={(event) => handleMediaTypeChange(index, event.target.value)}
                >
                  <option value="i">Image</option>
                  <option value="v">Video</option>
                </Form.Select>
              </Form.Group>
              <CategoryPlayerTeamImage
                key={`oComponentInput.aSector[${index}].oMedia-${normalizeSectorMediaType(value?.oComponentInput?.aSector?.[index]?.eMediaType)}`}
                galleryType="pb"
                title={normalizeSectorMediaType(value?.oComponentInput?.aSector?.[index]?.eMediaType) === 'v' ? 'Video*' : 'Image*'}
                name={`oComponentInput.aSector[${index}].oMedia`}
                register={register}
                setValue={setValue}
                urlFieldName={`oComponentInput.aSector[${index}].sMediaUrl`}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
                mediaType={normalizeSectorMediaType(value?.oComponentInput?.aSector?.[index]?.eMediaType) === 'v' ? 'video' : 'image'}
                required
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}

      <Button variant="primary" type="submit" className="m-2" disabled={loading}>
        <FormattedMessage id="update" />
        {loading && <Spinner animation="border" size="sm" />}
      </Button>
    </Form>
  )
}
