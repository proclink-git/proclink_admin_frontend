import React, { useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'

export default function FooterLocation() {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aAddresses'
  })

  useEffect(() => {
    if (fields.length === 0) append({ sLabel: '', sAddress: '' })
  }, [fields])

  return (
    <>
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button onClick={() => append({ sLabel: '', sAddress: '' })} variant="link" className="square icon-btn">
                  <i className="icon-add d-block" />
                </Button>
              )}
              {fields.length > 1 && (
                <Button onClick={() => remove(index)} variant="link" className="square icon-btn">
                  <i className="icon-delete d-block" />
                </Button>
              )}
            </>
          }
        >
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.aAddresses?.[index]?.sLabel && 'error'}
            name={`aAddresses[${index}].sLabel`}
            label="Label*"
            required
          />
          <CommonInput
            type="textarea"
            register={register}
            errors={errors}
            className={errors?.aAddresses?.[index]?.sAddress && 'error'}
            name={`aAddresses[${index}].sAddress`}
            label="Address*"
            required
            displayClass="mb-0"
          />
        </InputArrayBox>
      ))}
    </>
  )
}
