import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import ArticleTab from 'shared/components/article-tab'
import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'

function getDefaultTag() {
  return ''
}

export default function ArticleTags({ disabled }) {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aTags'
  })

  useEffect(() => {
    if (!fields.length) {
      append(getDefaultTag())
    }
  }, [append, fields.length])

  return (
    <ArticleTab title="Tags">
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultTag())} variant="link" size="sm" className="square icon-btn" disabled={disabled}>
                  <i className="icon-add d-block" />
                </Button>
              )}
              {fields.length > 1 && (
                <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn" disabled={disabled}>
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
            name={`aTags[${index}]`}
            label={`Tag ${index + 1}`}
            disabled={disabled}
            disableDefaultMaxLength
          />
        </InputArrayBox>
      ))}
    </ArticleTab>
  )
}

ArticleTags.propTypes = {
  disabled: PropTypes.bool
}
