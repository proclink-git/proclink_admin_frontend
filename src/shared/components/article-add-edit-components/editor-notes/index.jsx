import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'
import CommonInput from 'shared/components/common-input'

function EditorNotes({ errors, register, disabled }) {
  return (
    <ArticleTab title="Editor Notes">
      <CommonInput
        placeholder={useIntl().formatMessage({ id: 'writeHere' })}
        type="textarea"
        register={register}
        errors={errors}
        className={`form-control ${errors?.sEditorNotes && 'error'}`}
        name="sEditorNotes"
        label="addNotes"
        disabled={disabled}
      />
    </ArticleTab>
  )
}
EditorNotes.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  disabled: PropTypes.bool
}
export default EditorNotes
