import React, { Suspense, useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Badge, Form } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import moment from 'moment'

import PermissionProvider from 'shared/components/permission-provider'
import CustomAlert from 'shared/components/alert'
import { allRoutes } from 'shared/constants/AllRoutes'
import { useMutation } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'
import { ToastrContext } from 'shared/components/toastr'
import { UPDATE_ARTICLE_STATUS } from 'graph-ql/article/mutation'
import { HEADER_CATEGORY_SLUG_ADMIN, TOAST_TYPE, URL_PREFIX } from 'shared/constants'
import { colorBadge, getArticleState, dateCheck } from 'shared/utils'

const ArticlePreview = React.lazy(() => import('shared/components/article-add-edit-components/article-preview'))
const Drawer = React.lazy(() => import('shared/components/drawer'))

function ArticleItemRowAll({ article, onChange, bulkPermission, onSelect, selected, index }) {
  const { categoryType } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const { dispatch } = useContext(ToastrContext)
  const labels = {
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  const [deleteArticle] = useMutation(UPDATE_ARTICLE_STATUS, {
    onCompleted: (data) => {
      if (data.updateArticleStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateArticleStatus.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  async function handleStatusChange(status) {
    if (status === 't') {
      confirmAlert({
        title: labels.confirmationTitle,
        message: labels.confirmationMessage,
        customUI: CustomAlert,
        buttons: [
          {
            label: labels.yes,
            onClick: async () => {
              const { data } = await deleteArticle({
                variables: { input: { _id: article._id, eState: status, eHeaderCategoryType: categoryType } }
              })
              if (data.updateArticleStatus) {
                onChange(article._id, { eState: status })
              }
            }
          },
          {
            label: labels.no
          }
        ]
      })
    } else {
      const { data } = await deleteArticle({
        variables: { input: { _id: article._id, eState: status, eHeaderCategoryType: categoryType } }
      })
      if (data.updateArticleStatus) {
        onChange(article._id, { eState: status })
      }
    }
  }

  return (
    <>
      <tr>
        <PermissionProvider isAllowedTo={bulkPermission} isArray>
          <td>
            <Form.Check
              type="checkbox"
              id={selected[index]?._id}
              name={selected[index]?._id}
              checked={selected[index]?.value}
              className="form-check m-0"
              onChange={onSelect}
              label="&nbsp;"
            />
          </td>
        </PermissionProvider>
        <td>
          <div className="icons">
            {article?.oAdvanceFeature?.bBrandedContent && <i className="icon-campaign" />}
            <Badge bg={colorBadge(article?.eState)}>
              <FormattedMessage id={getArticleState(article.eState, Boolean(article?.iReviewerId))} />
            </Badge>
            {article?.bPriority && article?.eState !== 'pub' && <i className="icon-double-arrow-top danger" />}
          </div>
          <p className="title">{article?.sTitle}</p>
          {article?.eState === 'pub' && article?.dPublishDate && (
            <p className="date">
              <span>
                <FormattedMessage id="pd" />
              </span>
              {moment(dateCheck(article?.dPublishDate)).format('DD MMM YYYY LT')}
            </p>
          )}
          <div className="btn-b">
            <PermissionProvider
              isAllowedTo={[
                'EDIT_BLOG',
                'EDIT_WEBINAR',
                'EDIT_PODCAST',
                'EDIT_WHITEPAPER',
                'EDIT_RESEARCH_REPORT',
                'EDIT_VIDEO_LISTING',
                'EDIT_CASE_STUDY',
                'EDIT_NEWS_EVENTS'
              ]}
              isArray
            >
              <Button
                variant="link"
                as={Link}
                to={allRoutes.editPost(categoryType, article?._id, HEADER_CATEGORY_SLUG_ADMIN[categoryType])}
                className="square hover-none"
                size="sm"
              >
                <FormattedMessage id="edit" />
              </Button>
            </PermissionProvider>
            {/* {article?.eState !== 'pub' && (
              <Button variant="link" className="square hover-none" size="sm" onClick={() => setIsOpen(!isOpen)}>
                <FormattedMessage id="preview" />
              </Button>
            )} */}
            {article?.eState === 'pub' && (
              <Button variant="link" className="square hover-none" size="sm" target="_blank" href={`${URL_PREFIX}${article?.oSeo?.sSlug}`}>
                <FormattedMessage id="view" />
              </Button>
            )}
            {!['r', 'pub', 't', 's'].includes(article?.eState) && (
              <PermissionProvider
                isAllowedTo={[
                  'DELETE_BLOG',
                  'DELETE_WEBINAR',
                  'DELETE_PODCAST',
                  'DELETE_WHITEPAPER',
                  'DELETE_RESEARCH_REPORT',
                  'DELETE_VIDEO_LISTING',
                  'DELETE_CASE_STUDY',
                  'DELETE_NEWS_EVENTS'
                ]}
                isArray
              >
                <Button variant="link" className="square hover-none danger" size="sm" onClick={() => handleStatusChange('t')}>
                  <FormattedMessage id="trash" />
                </Button>
              </PermissionProvider>
            )}
            {/* {article?.eState === 'pub' && (
              <PermissionProvider isAllowedTo={["PUBLISH_DELETE_ARTICLE"]} isArray>
                <Button variant="link" className="square hover-none danger" size="sm" onClick={() => handleStatusChange('t')}>
                  <FormattedMessage id="trash" />
                </Button>
              </PermissionProvider>
            )} */}
            {article?.eState === 't' && (
              <PermissionProvider
                isAllowedTo={[
                  'EDIT_BLOG',
                  'EDIT_WEBINAR',
                  'EDIT_PODCAST',
                  'EDIT_WHITEPAPER',
                  'EDIT_RESEARCH_REPORT',
                  'EDIT_VIDEO_LISTING',
                  'EDIT_CASE_STUDY',
                  'EDIT_NEWS_EVENTS'
                ]}
                isArray
              >
                <Button variant="link" className="square hover-none" size="sm" onClick={() => handleStatusChange('p')}>
                  <FormattedMessage id="restoreToPending" />
                </Button>
              </PermissionProvider>
            )}
          </div>
        </td>
        <td>
          <a className="link" href={`${URL_PREFIX}authors/${article?.oAuthorSeo?.sSlug}`} target="_blank" rel="noreferrer">
            <p className="cat">{article?.oAuthor?.sFName || ' - '}</p>
          </a>
          <p className="date">
            <span>
              <FormattedMessage id="d" />
            </span>
            {moment(dateCheck(article?.dCreated)).format('DD MMM YYYY LT')}
          </p>
        </td>
        <td>
          <p className="keyword">{article?.oAssignedTo?.sFName || ' - '}</p>
          <p className="date">
            <span>
              <FormattedMessage id="lm" />
            </span>
            {moment(dateCheck(article?.dUpdated)).format('DD MMM YYYY LT')}
          </p>
        </td>
        <td>
          <p className="cat">
            <span>{article?.oCategory?.sName || '-'}</span>
          </p>
        </td>
      </tr>
      <Suspense>
        <Drawer className="article-preview" isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} title={<FormattedMessage id="preview" />}>
          <ArticlePreview slug={article?.oSeo?.sSlug} />
        </Drawer>
      </Suspense>
    </>
  )
}
ArticleItemRowAll.propTypes = {
  article: PropTypes.object,
  activeTab: PropTypes.string,
  onChange: PropTypes.func,
  bulkPermission: PropTypes.array,
  onSelect: PropTypes.func,
  selected: PropTypes.array,
  index: PropTypes.number
}
export default ArticleItemRowAll
