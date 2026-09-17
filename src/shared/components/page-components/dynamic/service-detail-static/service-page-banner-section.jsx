import React from 'react'
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'

import CountInput from 'shared/components/count-input'
import { HomeBannerRow } from 'shared/components/page-components/home-banner/row'

export default function ServicePageBannerSection({ basePath = 'oSPB', showContentField = true }) {
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  return (
    <div className="p-3">
      <HomeBannerRow basePath={basePath} registerTypeField={false} showCtaControls />
      {showContentField && (
        <CountInput
          textarea
          rows={6}
          currentLength={values?.sContent?.length}
          register={register(`${basePath}.sContent`)}
          error={errors}
          name={`${basePath}.sContent`}
          label="Content"
        />
      )}
    </div>
  )
}

ServicePageBannerSection.propTypes = {
  basePath: PropTypes.string,
  showContentField: PropTypes.bool
}
