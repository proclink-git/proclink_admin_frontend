import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

import { allRoutes } from 'shared/constants/AllRoutes'
import PermissionProvider from '../permission-provider'
import { HEADER_CATEGORY_SLUG_ADMIN } from 'shared/constants'
import ToolTip from 'shared/components/tooltip'

function CategorySimpleParentItemRow({ category, index, selectedCategory, onDelete, onStatusChange, onSelect, bulkPermission }) {
  const { categoryType } = useParams()
  return (
    <tr key={category?._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedCategory[index]?._id}
            name={selectedCategory[index]?._id}
            checked={selectedCategory[index]?.value || false}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>
        <p className="title">{category?.sName}</p>
        <p className="date">
          <span>
            <FormattedMessage id="d" />
          </span>
          {moment(Number(category?.dCreated)).format('ddd MMM DD YYYY')}
          <span>
            <FormattedMessage id="lm" />
          </span>
          {moment(Number(category?.dUpdated)).format('ddd MMM DD YYYY')}
        </p>
      </td>
      {/* <td>{category?.oSeo?.sSlug || '-'}</td> */}
      <td>{category?.nPriority || '-'}</td>
      <td>{category?.oSubAdmin?.sFName || '-'}</td>
      <td>
        <PermissionProvider isAllowedTo="CHANGE_STATUS_CATEGORY">
          <ToolTip toolTipMessage={<FormattedMessage id="toggle" />}>
            <Form.Check
              type="switch"
              name={category?._id}
              className="d-inline-block me-1"
              checked={category?.eStatus === 'a'}
              onChange={onStatusChange}
            />
          </ToolTip>
        </PermissionProvider>
        <PermissionProvider
          isAllowedTo={[
            'EDIT_BLOG_CATEGORY',
            'EDIT_WEBINAR_CATEGORY',
            'EDIT_PODCAST_CATEGORY',
            'EDIT_WHITEPAPER_CATEGORY',
            'EDIT_RESEARCH_REPORT_CATEGORY',
            'EDIT_VIDEO_LISTING_CATEGORY',
            'EDIT_CASE_STUDY_CATEGORY',
            'EDIT_NEWS_EVENTS_CATEGORY',
            'EDIT_MEDIA_GALLERY_CATEGORY',
            'VIEW_MEDIA_GALLERY'
          ]}
          isArray
        >
          <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
            <Button
              variant="link"
              className="square icon-btn"
              as={Link}
              to={allRoutes.editCategory(categoryType, category?._id, HEADER_CATEGORY_SLUG_ADMIN[categoryType])}
            >
              <i className="icon-create d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
        <PermissionProvider
          isAllowedTo={[
            'DELETE_BLOG_CATEGORY',
            'DELETE_WEBINAR_CATEGORY',
            'DELETE_PODCAST_CATEGORY',
            'DELETE_WHITEPAPER_CATEGORY',
            'DELETE_RESEARCH_REPORT_CATEGORY',
            'DELETE_VIDEO_LISTING_CATEGORY',
            'DELETE_CASE_STUDY_CATEGORY',
            'DELETE_NEWS_EVENTS_CATEGORY',
            'DELETE_MEDIA_GALLERY_CATEGORY',
            'VIEW_MEDIA_GALLERY'
          ]}
          isArray
        >
          <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
            <Button variant="link" className="square icon-btn" onClick={() => onDelete(category?._id)}>
              <i className="icon-delete d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
      </td>
    </tr>
  )
}
CategorySimpleParentItemRow.propTypes = {
  category: PropTypes.object,
  index: PropTypes.number,
  selectedCategory: PropTypes.array,
  bulkPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default CategorySimpleParentItemRow
