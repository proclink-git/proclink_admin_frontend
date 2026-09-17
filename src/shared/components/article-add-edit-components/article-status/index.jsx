import React from 'react'
import PropTypes from 'prop-types'
import { Badge, Form, ListGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useParams } from 'react-router'

import DisplayAuthor from '../display-author'
// import RejectModal from '../reject-modal'
import { getCurrentUser, colorBadge, getArticleState, getS3Url } from 'shared/utils'
// import ArticlePublishDate from '../article-publish-date'
import AssignedTo from '../assigned-to'

function ArticleStatus({ articleData, disabled, register, control, handleSubmit, submitHandler, displayAuthorType, type }) {
  const { id, categoryType } = useParams()
  const currentUser = getCurrentUser()

  return (
    <ListGroup variant="flush">
      <input type="hidden" name="eState" {...register('eState')} defaultValue="d" />
      <ListGroup.Item>
        <FormattedMessage id="status" />:
        <div className="st-box d-inline-block">
          <div>
            <Badge bg={colorBadge(id ? articleData?.eState : 'd')} className="margin">
              {id ? <FormattedMessage id={getArticleState(articleData?.eState, Boolean(articleData?.iReviewerId))} /> : '-'}
            </Badge>
            {/* {currentUser?._id === articleData?.iAuthorId && ['cr', 'r'].includes(articleData?.eState) && (
              <Button variant="outline-secondary square" size="sm">
                <i className="icon-comment" />
              </Button>
            )} */}
            {/* {currentUser?._id === articleData?.iReviewerId && ['cs', 'p'].includes(articleData?.eState) && (
              <Dropdown autoClose={'outside'}>
                <Dropdown.Toggle variant="secondary">
                  <i className="icon-more-horizontal" />
                </Dropdown.Toggle>

                <Dropdown.Menu className={'up-arrow'}>
                  <Dropdown.Item onClick={handleSubmit((d) => submitHandler(d, 'cr'))}>
                    <FormattedMessage id="changeRequired" />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleSubmit((d) => submitHandler(d, 'r'))}>
                    <FormattedMessage id="reject" />
                  </Dropdown.Item>
                  <RejectModal type={type} articleSubmit={handleSubmit} articleData={articleData} formSubmit={submitHandler} />
                </Dropdown.Menu>
              </Dropdown>
            )} */}
          </div>
          {/* {!['pub', 'r', 't', 's'].includes(articleData?.eState) && articleData?.iReviewerId && ( */}
          {articleData?.iReviewerId && articleData?.eState === 'p' && (
            <p>
              <i className="icon-lock-close" />
              {currentUser?._id === articleData?.iReviewerId ? 'You are editing' : articleData?.oReviewer?.sFName}
              {currentUser?._id !== articleData?.iReviewerId && ' is currently editing'}
              {/* {articleData?.oReviewer?.sDisplayName} <FormattedMessage id="isCurrentlyEditing" /> */}
            </p>
          )}
        </div>
      </ListGroup.Item>
      {/* <ListGroup.Item>
            <FormattedMessage id="revisions" />: <span className="margin">4 </span>
          </ListGroup.Item> */}
      <ListGroup.Item>
        <FormattedMessage id="author" />:
        <span className="user margin">
          {articleData?.oAuthor?.sUrl ? (
            <img src={getS3Url(articleData.oAuthor.sUrl)} alt={articleData?.oAuthor?.sFName} />
          ) : !id && currentUser?.sUrl ? (
            <img src={getS3Url(currentUser?.sUrl)} alt={currentUser?.sFName} />
          ) : (
            <i className="icon-account-fill no-img" />
          )}
          {currentUser?._id === articleData?.iAuthorId ? (
            <FormattedMessage id="you" />
          ) : (
            articleData?.oAuthor?.sFName || <FormattedMessage id="you" />
          )}
        </span>
      </ListGroup.Item>
      {categoryType === 'b' && (
        <ListGroup.Item>
          <FormattedMessage id="displayAuthor" />:
          <span className="user margin">
            <DisplayAuthor control={control} disabled={disabled} articleData={articleData} type={displayAuthorType} />
          </span>
        </ListGroup.Item>
      )}
      <ListGroup.Item>
        Assigned To:
        <span className="user margin">
          <AssignedTo control={control} disabled={disabled || currentUser.bSuperAdmin ? false : !!id} articleData={articleData} />
        </span>
      </ListGroup.Item>
      {articleData?.eState !== 'pub' && type !== 'ws' && (
        <ListGroup.Item>
          <FormattedMessage id="publishOnPriority" />:
          <span className="margin">
            <Form.Check
              type="switch"
              {...register('bPriority')}
              name="bPriority"
              className="d-inline-block"
              defaultChecked={false}
              disabled={disabled}
            />
          </span>
        </ListGroup.Item>
      )}
      {/* {articleData?.eState === 'pub' && (
        <ListGroup.Item>
          <FormattedMessage id="displayPublishDate" />:
          <div className="st-box d-inline-block">
            <ArticlePublishDate control={control} />
          </div>
        </ListGroup.Item>
      )} */}
    </ListGroup>
  )
}
ArticleStatus.propTypes = {
  articleData: PropTypes.object,
  openComment: PropTypes.func,
  disabled: PropTypes.bool,
  register: PropTypes.func,
  control: PropTypes.object,
  handleSubmit: PropTypes.func,
  submitHandler: PropTypes.func,
  displayAuthorType: PropTypes.string,
  type: PropTypes.string
}
export default React.memo(ArticleStatus)
