import React from 'react'
import CountInput from 'shared/components/count-input'
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'

export default function LtirsRow({ index, ltirsName = 'oLtirs' }) {
  const {
    register,
    getValues,
    formState: { errors },
    setValue,
    clearErrors
  } = useFormContext() // retrieve all hook methods

  return (
    <>
      <CountInput
        name={`${ltirsName}.aSection.[${index}].sTitle`}
        label="Icon Title"
        type="text"
        error={errors}
        className={errors?.oAboutUs?.oLtdiri?.aIconData?.[index]?.sTitle && 'error'}
        register={register(`${ltirsName}.aSection.[${index}].sTitle`)}
      />
      <CountInput
        textarea
        name={`${ltirsName}.aSection.[${index}].sDescription`}
        label="Description"
        type="text"
        error={errors}
        className={errors?.oAboutUs?.oLtdiri?.aIconData?.[index]?.sTitle && 'error'}
        register={register(`${ltirsName}.aSection.[${index}].sDescription`)}
      />
      <CategoryPlayerTeamImage
        galleryType="ltirs"
        name={`${ltirsName}.aSection.[${index}].oImg`}
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

LtirsRow.propTypes = {
  index: PropTypes.number.isRequired,
  ltirsName: PropTypes.string
}
