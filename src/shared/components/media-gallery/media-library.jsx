import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Row, Col } from 'react-bootstrap'
import Search from '../search'
import SingleImage from './single-image'
import PropTypes from 'prop-types'
import FeatureImageSidebar from './feature-image-sidebar'
import { FormattedMessage, useIntl } from 'react-intl'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_GALLERY_IMAGES } from 'graph-ql/article/query'
import Loading from '../loading'
import { bottomReached } from 'shared/utils'
import PermissionProvider from '../permission-provider'
import useMultiSelect from 'shared/hooks/useMultiSelect'
import { confirmAlert } from 'react-confirm-alert'
import CustomAlert from '../alert'
import { DELETE_IMAGE } from 'graph-ql/article/mutation'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from '../toastr'
import { getContentTypeFromMediaType } from '../../utils/media-content-type'

const MediaLibrary = ({ handleImage, onSubmit, isPlugin, overRidePermission, mediaType = 'image' }) => {
  const [payloads, setPayloads] = useState({ nSkip: 1, nLimit: 100, sSearch: null })
  const totalRef = useRef(0)
  const [open, setOpen] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState()
  const [imageData, setImageData] = useState()
  const [loadBtn, setLoadBtn] = useState(true)
  const isBottomReached = useRef(false)
  const [isBulkAction, setIsBulkAction] = useState(false)
  const { dispatch } = useContext(ToastrContext)
  const mediaLabel = mediaType === 'document' ? 'PDF' : mediaType === 'all' ? 'media' : mediaType

  function getGalleryInput(payload = payloads, type = mediaType) {
    const eContentType = getContentTypeFromMediaType(type)

    return {
      ...payload,
      ...(eContentType ? { eContentType } : {})
    }
  }

  const [getGalaryImages, { loading, refetch }] = useLazyQuery(GET_GALLERY_IMAGES, {
    variables: { input: getGalleryInput() },
    onCompleted: (data) => {
      if (data?.getImages?.aResults) {
        const results = data.getImages.aResults
        if (isBottomReached.current) {
          if (!loadBtn) {
            setImageData((currentItems) => [...(currentItems || []), ...results])
            totalRef.current = data.getImages.nTotal
            isBottomReached.current = false
          }
        } else {
          setImageData(results)
          totalRef.current = data.getImages.nTotal
        }
      }
    }
  })

  useEffect(() => {
    const nextPayload = { ...payloads, nSkip: 1 }

    setImageData()
    setSelectedImageId()
    setOpen(false)
    setLoadBtn(true)
    setIsBulkAction(false)
    isBottomReached.current = false
    setPayloads(nextPayload)
    getGalaryImages({ variables: { input: getGalleryInput(nextPayload, mediaType) } })
  }, [mediaType])

  const handleAfterDelete = (id) => setImageData(imageData?.filter((imgData) => imgData._id !== id))

  const handleLoadMore = () => {
    setLoadBtn(false)
  }

  function setPayload() {
    const nextPayload = { ...payloads, nSkip: payloads.nSkip + 1 }

    setPayloads(nextPayload)
    getGalaryImages({ variables: { input: getGalleryInput(nextPayload) } })
  }

  const handleId = (data) => {
    if (selectedImageId?._id === data?._id) {
      setSelectedImageId()
      setOpen(false)
      handleImage()
      return
    }

    setSelectedImageId(data)
    setOpen(true)
    handleImage(data)
  }

  const handleSideBar = () => {
    setOpen(true)
  }

  const handleSearch = (data) => {
    const nextPayload = { ...payloads, sSearch: data, nSkip: 1 }

    setPayloads(nextPayload)
    getGalaryImages({ variables: { input: getGalleryInput(nextPayload) } })
  }

  function handleScroll(e) {
    if (!loadBtn) {
      if (bottomReached(e) && !isBottomReached.current && imageData.length < totalRef.current) {
        isBottomReached.current = true
        setPayload()
      }
    }
  }

  const [deleteImage] = useMutation(DELETE_IMAGE, {
    onCompleted: (data) => {
      if (data) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteImage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    }
  })

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  const handleMultipleDelete = (ids) => setImageData(imageData?.filter((imgData) => !ids.includes(imgData?._id)))

  function handleDeleteImage(e) {
    e.preventDefault()
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            await deleteImage({ variables: { input: { aId: selectedMultiItems } } })
            handleMultipleDelete(selectedMultiItems)
            resetSelected()
            // ... delete api call here
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  function handleBulkActionEnable() {
    setSelectedImageId()
    setIsBulkAction(true)
    handleImage()
  }
  function handleBulkActionDisable() {
    resetSelected()
    setIsBulkAction(false)
  }

  const { onClick, resetSelected, selectedMultiItems } = useMultiSelect(imageData, { selector: (data) => data?._id })
  return (
    <>
      <Row>
        <Col className="mt-3">
          <Row className="my-2">
            <Col>
              <Search className="search-box only-border m-0" searchEvent={(e) => handleSearch(e)} />
            </Col>
          </Row>
          <PermissionProvider isAllowedTo="EDIT_MEDIA_GALLERY">
            <Row className="mb-2">
              {isBulkAction ? (
                <Col>
                  <Button size="sm" variant="danger" disabled={!selectedMultiItems?.length} className="square me-2" onClick={handleDeleteImage}>
                    <FormattedMessage id="deleteAllSelected" />
                  </Button>
                  <Button size="sm" variant="outline-info" className="square" onClick={handleBulkActionDisable}>
                    <FormattedMessage id="cancel" />
                  </Button>
                </Col>
              ) : (
                <Col>
                  <Button size="sm" variant="outline-success" className="square" onClick={handleBulkActionEnable}>
                    <FormattedMessage id="bulkAction" />
                  </Button>
                </Col>
              )}
            </Row>
          </PermissionProvider>
          {imageData?.length ? (
            <div onClick={handleSideBar}>
              <Row className="media-list gx-1" onScroll={handleScroll}>
                {imageData?.map((item, idx) => {
                  return (
                    <SingleImage
                      key={item._id}
                      data={item}
                      handleId={isBulkAction ? onClick : handleId}
                      isMulti={isBulkAction}
                      overRidePermission={overRidePermission}
                      selectedImageId={isBulkAction ? selectedMultiItems : selectedImageId}
                      mediaType={mediaType}
                    />
                  )
                })}
                {loadBtn && imageData?.length > 0 && (
                  <div className="mt-2 text-center">
                    <Button size="md" variant="primary" onClick={handleLoadMore}>
                      <FormattedMessage id="loadMore" />
                    </Button>
                  </div>
                )}
              </Row>
            </div>
          ) : (
            !loading && (
              <div className="middle-div text-center">
                No {mediaLabel} found
              </div>
            )
          )}
          {loading && <Loading />}
        </Col>
        <Col className="mt-4" md={3}>
          {open && selectedImageId && (
            <FeatureImageSidebar
              refetch={refetch}
              afterDelete={handleAfterDelete}
              data={selectedImageId}
              onSubmit={onSubmit}
              isPlugin={isPlugin}
              mediaType={mediaType}
            />
          )}
        </Col>
      </Row>
    </>
  )
}

MediaLibrary.propTypes = {
  handleImage: PropTypes.func,
  isClearImage: PropTypes.bool,
  register: PropTypes.func,
  getValues: PropTypes.func,
  onSubmit: PropTypes.func,
  isPlugin: PropTypes.bool,
  overRidePermission: PropTypes.bool,
  mediaType: PropTypes.oneOf(['all', 'image', 'video', 'document'])
}

export default MediaLibrary
