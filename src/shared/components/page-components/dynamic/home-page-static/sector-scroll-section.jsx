import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { getDefaultSector } from './utils'
import ImageDimensionNote from 'shared/components/image-dimension-note'

function getEmptyMedia() {
  return {
    sUrl: '',
    sText: '',
    sCaption: '',
    sAttribute: ''
  }
}

function normalizeSectorMediaType(value = '') {
  if (value === 'v' || value === 'video') return 'v'
  return 'i'
}

export default function SectorScrollSection({ basePath = 'oHomePage.oSSC' }) {
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

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `${basePath}.aSector`
  })

  useEffect(() => {
    if (fields.length) return

    const currentSectors = getValues(`${basePath}.aSector`)
    if (Array.isArray(currentSectors) && currentSectors.length) {
      replace(currentSectors)
      return
    }

    append(getDefaultSector())
  }, [append, basePath, fields.length, getValues, replace])

  function handleMediaTypeChange(index, mediaType) {
    const sectorPath = `${basePath}.aSector[${index}]`

    setValue(`${sectorPath}.eMediaType`, mediaType, { shouldDirty: true })
    setValue(`${sectorPath}.sMediaUrl`, '', { shouldDirty: true })
    setValue(`${sectorPath}.oMedia`, getEmptyMedia(), { shouldDirty: true })
    clearErrors([`${sectorPath}.sMediaUrl`, `${sectorPath}.oMedia`])
  }

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Sector Scroll</Form.Label>

      <CountInput textarea rows={6} currentLength={values?.sMainDescription?.length} register={register(`${basePath}.sMainDescription`)} error={errors} name={`${basePath}.sMainDescription`} label="Main Description*" />

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultSector())} variant="link" size="sm" className="square icon-btn">
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
          <Form.Label>Sector {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput type="text" currentLength={values?.aSector?.[index]?.sTitle?.length} register={register(`${basePath}.aSector[${index}].sTitle`)} error={errors} name={`${basePath}.aSector[${index}].sTitle`} label="Title*" />
              <CountInput textarea rows={6} currentLength={values?.aSector?.[index]?.sDescription?.length} register={register(`${basePath}.aSector[${index}].sDescription`)} error={errors} name={`${basePath}.aSector[${index}].sDescription`} label="Description*" />
              <CountInput type="text" currentLength={values?.aSector?.[index]?.sSlug?.length} register={register(`${basePath}.aSector[${index}].sSlug`)} error={errors} name={`${basePath}.aSector[${index}].sSlug`} label="Slug" />
            </Col>
            <Col sm="4" className="add-article">
            <ImageDimensionNote width={1720} height={755} subject="sector scroll media" />
              <Form.Group className="form-group">
                <Form.Label>Media Type</Form.Label>
                <Form.Select
                  {...register(`${basePath}.aSector[${index}].eMediaType`)}
                  onChange={(event) => handleMediaTypeChange(index, event.target.value)}
                >
                  <option value="i">Image</option>
                  <option value="v">Video</option>
                </Form.Select>
              </Form.Group>
              <CategoryPlayerTeamImage
                key={`${basePath}.aSector[${index}].oMedia-${normalizeSectorMediaType(values?.aSector?.[index]?.eMediaType)}`}
                galleryType="pb"
                title={normalizeSectorMediaType(values?.aSector?.[index]?.eMediaType) === 'v' ? 'Video*' : 'Image*'}
                name={`${basePath}.aSector[${index}].oMedia`}
                register={register}
                setValue={setValue}
                urlFieldName={`${basePath}.aSector[${index}].sMediaUrl`}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
                mediaType={normalizeSectorMediaType(values?.aSector?.[index]?.eMediaType) === 'v' ? 'video' : 'image'}
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

SectorScrollSection.propTypes = {
  basePath: PropTypes.string
}
