import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import TitleFormatHint from 'shared/components/title-format-hint'

export default function ProofStripSection({
  basePath = 'oPS',
  sectionLabel = 'Proof Strip',
  showBadge = true,
  titleLabel = 'Headline',
  ctaField = 'aCta[0]',
  ctaLabel = 'Button Label',
  ctaUrlLabel = 'Button Link'
}) {
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>
      {showBadge && <CountInput type="text" currentLength={values?.sBadge?.length} register={register(`${basePath}.sBadge`)} error={errors} name={`${basePath}.sBadge`} label="Badge" />}
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label={titleLabel} />
      <TitleFormatHint subject="headline" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />
      <Row className="g-2">
        <Col md="5">
          <CountInput type="text" currentLength={values?.aCta?.[0]?.sLabel?.length || values?.oCta?.sLabel?.length} register={register(`${basePath}.${ctaField}.sLabel`)} error={errors} name={`${basePath}.${ctaField}.sLabel`} label={ctaLabel} />
        </Col>
        <Col md="7">
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.${ctaField}.sUrl`} label={ctaUrlLabel} disableDefaultMaxLength />
        </Col>
      </Row>
    </div>
  )
}

ProofStripSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  showBadge: PropTypes.bool,
  titleLabel: PropTypes.string,
  ctaField: PropTypes.string,
  ctaLabel: PropTypes.string,
  ctaUrlLabel: PropTypes.string
}
