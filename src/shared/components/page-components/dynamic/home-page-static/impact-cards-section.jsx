import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { getDefaultImpactCard } from './utils'

const IMPACT_CARD_COUNT = 4

export default function ImpactCardsSection({ basePath = 'oHomePage.oICD' }) {
  const {
    register,
    control,
    getValues,
    watch,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  const { fields, replace } = useFieldArray({
    control,
    name: `${basePath}.aCard`
  })

  useEffect(() => {
    if (fields.length === IMPACT_CARD_COUNT) return

    const currentCards = Array.isArray(getValues(`${basePath}.aCard`)) ? getValues(`${basePath}.aCard`) : []
    const nextCards = currentCards.slice(0, IMPACT_CARD_COUNT)

    while (nextCards.length < IMPACT_CARD_COUNT) {
      nextCards.push(getDefaultImpactCard())
    }

    replace(nextCards)
  }, [basePath, fields.length, getValues, replace])

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Impact Cards</Form.Label>

      <Row>
        {fields.map((field, index) => (
          <Col md="6" key={field.id}>
            <InputArrayBox className="mb-3">
              <Form.Label>Card {index + 1}</Form.Label>
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Title*" />
              <CountInput textarea rows={6} currentLength={values?.aCard?.[index]?.sDescription?.length} register={register(`${basePath}.aCard[${index}].sDescription`)} error={errors} name={`${basePath}.aCard[${index}].sDescription`} label="Description*" />
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sNumber`} label="Number" disableDefaultMaxLength />
            </InputArrayBox>
          </Col>
        ))}
      </Row>
    </div>
  )
}

ImpactCardsSection.propTypes = {
  basePath: PropTypes.string
}
