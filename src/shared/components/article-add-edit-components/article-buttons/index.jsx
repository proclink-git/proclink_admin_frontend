import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'

import { getCurrentUser } from 'shared/utils'
import { useParams } from 'react-router'
import PermissionProvider from 'shared/components/permission-provider'
// import ArticleShare from '../article-share'
import { confirmAlert } from 'react-confirm-alert'
import CustomAlert from 'shared/components/alert'
import { URL_PREFIX } from 'shared/constants'

const Drawer = React.lazy(() => import('shared/components/drawer'))
const ArticlePreview = React.lazy(() => import('../article-preview'))

function getFirstErrorPath(errors, parentPath = '') {
  if (!errors || typeof errors !== 'object') return ''
  if (errors.message || errors.type) return parentPath

  const keys = Object.keys(errors)

  for (const key of keys) {
    const value = errors[key]
    const nextPath = Array.isArray(errors) ? `${parentPath}[${key}]` : parentPath ? `${parentPath}.${key}` : key
    const errorPath = getFirstErrorPath(value, nextPath)

    if (errorPath) return errorPath
  }

  return ''
}

function focusInvalidField(errors) {
  const errorPath = getFirstErrorPath(errors)

  if (!errorPath || typeof document === 'undefined') return

  const escapedPath = errorPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const field = document.querySelector(`[name="${escapedPath}"]`)

  if (!field) return

  field.scrollIntoView({ behavior: 'smooth', block: 'center' })
  if (typeof field.focus === 'function') field.focus({ preventScroll: true })
}

function ArticleButtons({ articleData, handleSubmit, setValue, values, submitHandler, pickHandler, statusHandler, permission, disabled, tokenType }) {
  const [isOpen, setIsOpen] = useState(false)
  const { id } = useParams()
  const currentUser = getCurrentUser()

  const labels = {
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  function submitWithState(eState) {
    return handleSubmit((d) => submitHandler(d, eState), focusInvalidField)
  }

  function handleDelete() {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            if (statusHandler) await statusHandler('t')
            else submitWithState('t')()
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  return (
    <>
      <div className="left">
        {/* When status is draft */}
        {(!id || (id && articleData?.eState === 'd')) && (
          <>
            <Button size="sm" disabled={disabled} variant="primary" onClick={submitWithState('p')}>
              Assign
            </Button>
            {/* <PermissionProvider isAllowedTo={permission.edit} isArray>
              <Button variant="outline-secondary" disabled={disabled} size="sm" onClick={submitWithState('d')}>
                <FormattedMessage id="saveDraft" />
              </Button>
            </PermissionProvider> */}
          </>
        )}
        {/* When status is pending */}
        {articleData?.eState === 'p' && (
          <>
            {/* {currentUser._id === articleData.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.publish} isArray>
                <Button size="sm" variant="primary" onClick={submitWithState('pub')}>
                  <FormattedMessage id="publish" />
                </Button>
              </PermissionProvider>
            )} */}
            {articleData.iReviewerId === currentUser._id && (
              <PermissionProvider isAllowedTo={permission.edit} isArray>
                <Button size="sm" variant="primary" onClick={submitWithState('cs')}>
                  Submit for Review
                </Button>
              </PermissionProvider>
            )}
            {!articleData.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.edit} isArray>
                <Button size="sm" variant="primary" onClick={() => pickHandler('p')}>
                  Pick
                </Button>
              </PermissionProvider>
            )}
            {/* {articleData.iReviewerId && currentUser._id !== articleData.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.overtake} isArray>
                <Button size="sm" variant="primary" onClick={() => pickHandler('o')}>
                  <FormattedMessage id="overTake" />
                </Button>
              </PermissionProvider>
            )} */}
            {!articleData.iReviewerId && currentUser._id === articleData.iAuthorId && (
              <Button size="sm" variant="primary" onClick={submitWithState('p')}>
                Edit
              </Button>
            )}
            {currentUser._id === articleData.iReviewerId && (
              <Button variant="outline-secondary" size="sm" onClick={submitWithState('p')}>
                <FormattedMessage id="save" /> <FormattedMessage id="changes" />
              </Button>
            )}
          </>
        )}
        {/* When status is changes remaining */}
        {articleData?.eState === 'cr' && (
          <>
            {currentUser._id === articleData?.iAuthorId && (
              <>
                <Button size="sm" variant="primary" onClick={submitWithState('cs')}>
                  <FormattedMessage id="resubmitChanges" />
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={submitWithState('cr')}>
                  <FormattedMessage id="save" /> <FormattedMessage id="changes" />
                </Button>
              </>
            )}
            {/* {articleData.iReviewerId && currentUser._id !== articleData.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.overtake}>
                <Button size="sm" variant="primary" onClick={() => pickHandler('o')}>
                  <FormattedMessage id="overTake" />
                </Button>
              </PermissionProvider>
            )} */}
          </>
        )}
        {/* When status is changes submitted */}
        {articleData?.eState === 'cs' && (
          <>
            <PermissionProvider isAllowedTo={permission.publish} isArray>
              <Button size="sm" variant="primary" onClick={submitWithState('pub')}>
                <FormattedMessage id="publish" />
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={submitWithState('cs')}>
                <FormattedMessage id="save" /> <FormattedMessage id="changes" />
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={submitWithState('p')}>
                Re Assign
              </Button>
            </PermissionProvider>
          </>
        )}
        {/* When status is published */}
        {articleData?.eState === 'pub' && (
          <>
            {/* {currentUser._id !== articleData?.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.publishAfterSave} isArray>
                <Button size="sm" variant="primary" onClick={() => pickHandler('o')}>
                  <FormattedMessage id="overTake" />
                </Button>
              </PermissionProvider>
            )} */}
            <PermissionProvider isAllowedTo={permission.publishAfterSave} isArray>
              <Button size="sm" variant="primary" onClick={submitWithState('pub')}>
                <FormattedMessage id="save" /> <FormattedMessage id="changes" />
              </Button>
            </PermissionProvider>
            <Button
              variant="outline-secondary"
              size="sm"
              target="_blank"
              href={`${URL_PREFIX}${articleData?.slug || articleData?.oSeo?.sSlug}`}
            >
              <FormattedMessage id="view" />
            </Button>
          </>
        )}
        {/* When status is trash */}
        {articleData?.eState === 't' && (
          <PermissionProvider isAllowedTo={permission.edit} isArray>
            <Button size="sm" variant="primary" onClick={statusHandler ? () => statusHandler('p') : submitWithState('p')}>
              <FormattedMessage id="restoreToPending" />
            </Button>
          </PermissionProvider>
        )}
        {/* {articleData && articleData?.eState !== 'pub' && articleData?.oSeo?.sSlug && (
          <Button variant="outline-secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>
            <FormattedMessage id="preview" />
          </Button>
        )} */}
      </div>
      <div className="right text-end">
        {/* {(articleData?.eState !== 'pub' && currentUser._id === articleData.iAuthorId) && ( */}
        {/* {articleData && articleData?.eState !== 'pub' && (
          <ArticleShare slug={articleData?.slug || articleData?.oSeo?.sSlug} eType={tokenType} />
        )} */}
        {/* If status is not rejected  */}
        {id && !['r', 'pub', 't', 's'].includes(articleData?.eState) && (
          <PermissionProvider isAllowedTo={permission.delete} isArray>
            <Button variant="link" className="square icon-btn" onClick={handleDelete}>
              <i className="icon-delete d-block text-danger" />
            </Button>
          </PermissionProvider>
        )}
        {/* When status is published */}
        {articleData?.eState === 'pub' && (
          <PermissionProvider isAllowedTo={permission.deleteAfterPublish} isArray>
            <Button variant="link" className="square icon-btn" onClick={handleDelete}>
              <i className="icon-delete d-block text-danger" />
            </Button>
          </PermissionProvider>
        )}
      </div>
      <Drawer className="article-preview" isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} title={<FormattedMessage id="preview" />}>
        <ArticlePreview slug={articleData?.slug || articleData?.oSeo?.sSlug} isAmp={values()?.oAdvanceFeature?.bAmp} />
      </Drawer>
    </>
  )
}
ArticleButtons.propTypes = {
  articleData: PropTypes.object,
  handleSubmit: PropTypes.func,
  setValue: PropTypes.func,
  values: PropTypes.func,
  submitHandler: PropTypes.func,
  pickHandler: PropTypes.func,
  statusHandler: PropTypes.func,
  permission: PropTypes.object,
  disabled: PropTypes.bool,
  tokenType: PropTypes.string
}
export default React.memo(ArticleButtons)
