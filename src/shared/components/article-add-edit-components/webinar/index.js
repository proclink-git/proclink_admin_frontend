import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'

import PodcastFields from 'shared/components/article-add-edit-components/podcast-fields'
import { DLF_FORM_TYPE, WEBINAR_TYPE_OPTIONS } from 'shared/components/page-components/dynamic/article-static/download-lead-form.utils'

export function WebinarTypeSelector({ value = DLF_FORM_TYPE.WEBINAR_REGISTER, onChange, disabled = false }) {
  return (
    <Form.Group className="form-group">
      <Form.Label>Webinar Type</Form.Label>
      <Form.Select value={value || DLF_FORM_TYPE.WEBINAR_REGISTER} onChange={onChange} disabled={disabled}>
        {WEBINAR_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  )
}

WebinarTypeSelector.propTypes = {
  value: PropTypes.oneOf([DLF_FORM_TYPE.WEBINAR_REGISTER, DLF_FORM_TYPE.WEBINAR_RECORDING]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool
}

export default function WebinarFields({ disabled = false, videoSource = 'url', onVideoSourceChange }) {
  return (
    <PodcastFields
      disabled={disabled}
      videoSource={videoSource}
      onVideoSourceChange={onVideoSourceChange}
      showEpisodeNumber={false}
      fieldNames={{ link: 'oWebInar.sLink', durationLabel: 'oWebInar.sDurationLabel' }}
      urlThumbnailLabel="Video Thumbnail"
    />
  )
}

WebinarFields.propTypes = {
  disabled: PropTypes.bool,
  videoSource: PropTypes.oneOf(['url', 'gallery']),
  onVideoSourceChange: PropTypes.func
}
