import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CountInput from 'shared/components/count-input'

const BROWSE_CONTENT_DISPLAY_ONLY_COMPONENT_TYPES = new Set(['bba', 'bpo', 'bcs', 'bcu', 'bcy', 'brr', 'bvl', 'bwe', 'bwp', 'bmg'])

export function shouldShowBrowseContentSettings(componentType = '') {
  return !BROWSE_CONTENT_DISPLAY_ONLY_COMPONENT_TYPES.has(String(componentType || '').toLowerCase())
}

export default function BrowseContentSection({ basePath, sectionLabel = 'Browse Content', showSettings = true }) {
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext()
  const values = basePath ? watch(basePath) || {} : {}

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>
      {basePath && showSettings ? (
        <>
          <CountInput
            type="text"
            currentLength={values?.sListingTitle?.length}
            register={register(`${basePath}.sListingTitle`)}
            error={errors}
            name={`${basePath}.sListingTitle`}
            label="Title"
          />
          <CountInput
            textarea
            rows={4}
            currentLength={values?.sListingDescription?.length}
            register={register(`${basePath}.sListingDescription`)}
            error={errors}
            name={`${basePath}.sListingDescription`}
            label="Subtitle"
          />
        </>
      ) : (
        <p className="text-muted mb-0">This section is driven by published content in the selected category and does not require additional settings here.</p>
      )}
    </div>
  )
}

BrowseContentSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  showSettings: PropTypes.bool
}
