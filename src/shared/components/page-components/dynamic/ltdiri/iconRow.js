import React from 'react'
import PropTypes from 'prop-types'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import { useFormContext } from 'react-hook-form'
import CountInput from 'shared/components/count-input'

function IconRow({ index, ltdiriName = 'oLtdiri' }) {
  const {
    register,
    getValues,
    clearErrors,
    setValue,
    formState: { errors }
  } = useFormContext() // retrieve all hook methods

  // const values = getValues()

  return (
    <>
      <CountInput
        name={`${ltdiriName}.aIconData.[${index}].sTitle`}
        label="Icon Title"
        type="text"
        error={errors}
        className={errors}
        register={register(`${ltdiriName}.aIconData[${index}].sTitle`)}
      />
      <CategoryPlayerTeamImage
        galleryType="icon"
        name={`${ltdiriName}.aIconData.[${index}].oIcon`}
        register={register}
        setValue={setValue}
        values={getValues()}
        errors={errors}
        clearErrors={clearErrors}
        hideCaption
        hideAttribution
      />
    </>
  )
}

IconRow.propTypes = {
  index: PropTypes.number.isRequired,
  ltdiriName: PropTypes.string.isRequired
}

export default IconRow
