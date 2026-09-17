import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'

export default function EditorSectionNavigator({ sections, activeSectionId, onJump, mobileMode }) {
  if (!sections?.length) return null

  const selectedSectionId = sections.some((section) => section.id === activeSectionId) ? activeSectionId : sections[0]?.id
  const activeSection = sections.find((section) => section.id === selectedSectionId)

  if (mobileMode) {
    return (
      <div className="editor-section-navigator editor-section-navigator--mobile">
        <div className="editor-section-navigator__header">
          <span className="editor-section-navigator__eyebrow">Quick Navigation</span>
          <span className="editor-section-navigator__mobile-current">{activeSection?.label || 'Jump to section'}</span>
        </div>
        <Form.Select
          value={selectedSectionId}
          onChange={(event) => onJump(event.target.value)}
          aria-label="Jump to editor section"
          className="editor-section-navigator__select"
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </Form.Select>
      </div>
    )
  }

  return (
    <div className="editor-section-navigator">
      <div className="editor-section-navigator__header">
        <span className="editor-section-navigator__eyebrow">Quick Navigation</span>
        <h2 className="editor-section-navigator__title">Sections</h2>
      </div>
      <div className="editor-section-navigator__list" role="navigation" aria-label="Editor sections">
        {sections.map((section, index) => {
          const isActive = section.id === selectedSectionId

          return (
            <button
              key={section.id}
              type="button"
              className={`editor-section-navigator__item ${isActive ? 'is-active' : ''}`}
              onClick={() => onJump(section.id)}
              aria-current={isActive ? 'location' : undefined}
            >
              <span className="editor-section-navigator__item-marker" aria-hidden="true" />
              <span className="editor-section-navigator__item-content">
                <span className="editor-section-navigator__item-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="editor-section-navigator__item-label">{section.label}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

EditorSectionNavigator.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  activeSectionId: PropTypes.string,
  onJump: PropTypes.func,
  mobileMode: PropTypes.bool
}

EditorSectionNavigator.defaultProps = {
  sections: [],
  activeSectionId: '',
  onJump: () => {},
  mobileMode: false
}
