import PropTypes from 'prop-types'
import { React, useEffect } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { getNestedObject } from 'shared/utils'

export default function SubServiceComponent({ basePath, subServiceComponent = 'oSubServiceComponent' }) {
  const {
    formState: { errors },
    register,
    control,
    setValue,
    getValues,
    clearErrors
  } = useFormContext()

  const fieldName = basePath || subServiceComponent
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldName}.aSubService`
  })

  function getChildDefaultValues() {
    return { sTitle: '', oIcon: { sUrl: '' } }
  }

  useEffect(() => {
    if (fields.length === 0) append({ sTitle: '', oIcon: { sUrl: '', sText: '' } })
  }, [fields])

  const result = getNestedObject(errors, fieldName)

  return (
        <>
            <Form.Group className="form-group mb-0">
                <Form.Label>Sub Service Component</Form.Label>
                <CommonInput
                    type="text"
                    register={register}
                    label="Title"
                    name={`${fieldName}.sTitle`}
                    errors={errors}
                    className={result?.sTitle && 'error'}
                />
                <CommonInput
                    type="text"
                    register={register}
                    label="Description"
                    name={`${fieldName}.sDescription`}
                    errors={errors}
                    className={result?.sDescription && 'error'}
                />
                <Row>

                    {fields.map((field, index) => (
                        <Col sm={4} key={field.id}>
                            <InputArrayBox
                                className="add-article mt-4"
                                actions={
                                    <>
                                        {index === fields.length - 1 && fields.length > 0 && (
                                            <Button onClick={() => append(getChildDefaultValues())} variant="link" size="sm" className="square icon-btn">
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
                                <CategoryPlayerTeamImage
                                    galleryType="icon"
                                    name={`${fieldName}.aSubService.[${index}].oIcon`}
                                    register={register}
                                    setValue={setValue}
                                    // onDelete={console.log}
                                    values={getValues()}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    // imgUrl={reset}
                                    hideCaption
                                    hideAttribution
                                />
                                <br />
                                <CountInput
                                    type="text"
                                    register={register(`${fieldName}.aSubService.[${index}].sTitle`)}
                                    error={errors}
                                    displayClass="mt-2"
                                    className={result?.aSubService?.[index]?.sTitle && 'error'}
                                    name={`${fieldName}.aSubService.[${index}].sTitle`}
                                    label="Title"
                                />
                            </InputArrayBox>
                        </Col>
                    ))}
                </Row>
            </Form.Group>
        </>
  )
}

SubServiceComponent.propTypes = {
  basePath: PropTypes.string,
  subServiceComponent: PropTypes.string
}
