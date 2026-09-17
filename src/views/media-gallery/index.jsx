import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { Button, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { confirmAlert } from 'react-confirm-alert'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import Select from 'react-select'
import moment from 'moment'

import CustomAlert from 'shared/components/alert'
import DataTable from 'shared/components/data-table'
import MediaGallery from 'shared/components/media-gallery'
import SvgPreview from 'shared/components/media-gallery/svg-preview'
import TopBar from 'shared/components/top-bar'
import { GET_CATEGORY_LIST } from 'graph-ql/management/category'
import { EDIT_IMAGE } from 'graph-ql/article/mutation'
import { EDIT_MEDIA_GALLERY_ITEMS, LIST_MEDIA_GALLERY_ITEM, UPDATE_MEDIA_GALLERY_ITEM_STATUS } from 'graph-ql/media-gallery'
import { ToastrContext } from 'shared/components/toastr'
import { HEADER_CATEGORY_TYPE, TOAST_TYPE } from 'shared/constants'
import { appendParams, convertIntoKb, getS3Url, isSvgMedia, parseParams } from 'shared/utils'

const MEDIA_GALLERY_TYPE = HEADER_CATEGORY_TYPE['media-gallery']
const MEDIA_GALLERY_EDIT_PERMISSIONS = ['EDIT_MEDIA_GALLERY', 'VIEW_MEDIA_GALLERY']
const EMPTY_MEDIA_FORM = {
  sText: '',
  sCaption: '',
  sAttribute: ''
}

function getFileName(url = '') {
  return String(url).split('?')[0].split('/').pop() || '-'
}

function getFormattedDate(date) {
  if (!date) return '-'

  const numericDate = Number(date)
  const parsedDate = Number.isNaN(numericDate) ? moment(date) : moment(numericDate)

  return parsedDate.isValid() ? parsedDate.format('ddd MMM DD YYYY') : '-'
}

function getMediaFormValues(item = {}) {
  return {
    sText: item?.sText || '',
    sCaption: item?.sCaption || '',
    sAttribute: item?.sAttribute || ''
  }
}

function hasMediaDetailsChanged(item = {}, values = EMPTY_MEDIA_FORM) {
  return (
    (item?.sText || '') !== (values.sText || '') ||
    (item?.sCaption || '') !== (values.sCaption || '') ||
    (item?.sAttribute || '') !== (values.sAttribute || '')
  )
}

function MediaGalleryRow({ item, canEdit, isDeleting, onDelete, onEdit }) {
  return (
    <tr>
      <td>
        <div className="media-gallery-item">
          {isSvgMedia(item?.sUrl) ? (
            <SvgPreview src={item?.sUrl} className="media-gallery-item__thumb" alt={item?.sText || item?.sCaption || 'Media gallery item'} />
          ) : (
            <img className="media-gallery-item__thumb" src={getS3Url(item?.sUrl)} alt={item?.sText || item?.sCaption || 'Media gallery item'} />
          )}
          <div className="media-gallery-item__body">
            <span className="media-gallery-item__title">{getFileName(item?.sUrl)}</span>
            <span className="media-gallery-item__url">{item?.sUrl}</span>
          </div>
        </div>
      </td>
      <td>{item?.oCategory?.sName || '-'}</td>
      <td>
        <span className="d-block">{item?.sText || '-'}</span>
        {item?.sCaption && <span className="media-gallery-item__muted">{item.sCaption}</span>}
      </td>
      <td>
        {item?.oMeta?.nWidth && item?.oMeta?.nHeight ? (
          <span className="d-block">
            {item.oMeta.nWidth} x {item.oMeta.nHeight}
          </span>
        ) : (
          <span className="d-block">-</span>
        )}
        {item?.oMeta?.nSize && <span className="media-gallery-item__muted">{convertIntoKb(item.oMeta.nSize)} KB</span>}
      </td>
      <td>{getFormattedDate(item?.dCreated)}</td>
      {canEdit && (
        <td className="text-end">
          <Button variant="link" className="square icon-btn" title="Edit" onClick={() => onEdit(item)}>
            <i className="icon-create d-block" />
          </Button>
          <Button variant="link" className="square icon-btn" title="Delete" disabled={isDeleting} onClick={() => onDelete(item?._id)}>
            <i className="icon-delete d-block" />
          </Button>
        </td>
      )}
    </tr>
  )
}

MediaGalleryRow.propTypes = {
  item: PropTypes.object,
  canEdit: PropTypes.bool,
  isDeleting: PropTypes.bool,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
}

function MediaGalleryItems({ userPermission }) {
  const { categoryType = MEDIA_GALLERY_TYPE } = useParams()
  const history = useHistory()
  const intl = useIntl()
  const client = useApolloClient()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [formMode, setFormMode] = useState('add')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [editingGalleryItemId, setEditingGalleryItemId] = useState(null)
  const [mediaForm, setMediaForm] = useState(EMPTY_MEDIA_FORM)
  const totalRecord = useRef(0)

  const isEditMode = formMode === 'edit'
  const canEditMediaGallery = !!userPermission?.some((permission) => MEDIA_GALLERY_EDIT_PERMISSIONS.includes(permission))
  const labels = {
    yes: intl.formatMessage({ id: 'yes' }),
    no: intl.formatMessage({ id: 'no' }),
    close: intl.formatMessage({ id: 'close' }),
    confirmationTitle: intl.formatMessage({ id: 'confirmation' }),
    confirmationMessage: intl.formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const columns = useRef([
    { name: 'Image', internalName: 'sUrl' },
    { name: 'Category', internalName: 'oCategory.sName' },
    { name: 'Alt / Caption', internalName: 'sText' },
    { name: 'Meta', internalName: 'oMeta' },
    { name: 'Created', internalName: 'dCreated' }
  ])

  const listInput = useMemo(() => getListInput(requestParams), [requestParams])

  function handleListResponse(data) {
    if (!data?.listMediaGalleryItem) return

    totalRecord.current = data.listMediaGalleryItem.nTotal || 0
    setItems(data.listMediaGalleryItem.aResults || [])
  }

  const { data: mediaGalleryListData, loading, refetch } = useQuery(LIST_MEDIA_GALLERY_ITEM, {
    variables: { input: listInput },
    notifyOnNetworkStatusChange: true
  })

  useEffect(() => {
    handleListResponse(mediaGalleryListData)
  }, [mediaGalleryListData])

  const { loading: categoryLoading } = useQuery(GET_CATEGORY_LIST, {
    variables: {
      input: {
        eHeaderCategoryType: categoryType || MEDIA_GALLERY_TYPE,
        eType: 's',
        nSkip: 1,
        nLimit: 10,
        sSortBy: 'sName',
        nOrder: 1,
        sSearch: ''
      }
    },
    onCompleted: (data) => {
      setCategories(data?.getCategory?.aResults || [])
    }
  })

  const [editImage, { loading: isSavingImage }] = useMutation(EDIT_IMAGE)
  const [editMediaGalleryItems, { loading: isSavingMediaGalleryItem }] = useMutation(EDIT_MEDIA_GALLERY_ITEMS)
  const [updateMediaGalleryItemStatus, { loading: isDeletingMediaGalleryItem }] = useMutation(UPDATE_MEDIA_GALLERY_ITEM_STATUS)
  const isSubmitting = isSavingImage || isSavingMediaGalleryItem

  useEffect(() => {
    if (params.current.aCategoryFilters) {
      appendParams({ aCategoryFilters: [] })
    }

    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current

    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10
    }
  }

  function getListInput(data = {}) {
    const nLimit = Number(data.nLimit) || 10
    const nSkip = Number(data.nSkip) || 1

    return {
      nLimit,
      nSkip
    }
  }

  function showToast(message, type = TOAST_TYPE.Error) {
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message, type, btnTxt: labels.close }
    })
  }

  async function invalidateMediaGalleryList() {
    client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'listMediaGalleryItem' })
    client.cache.gc()
    const { data } = await refetch({ input: getListInput(requestParams) })

    const nTotal = data?.listMediaGalleryItem?.nTotal || 0
    const lastPage = Math.max(Math.ceil(nTotal / requestParams.nLimit), 1)

    if (requestParams.nSkip > lastPage) {
      const nextRequestParams = { ...requestParams, nSkip: lastPage }

      setRequestParams(nextRequestParams)
      appendParams({ nSkip: lastPage })

      const { data: lastPageData } = await refetch({ input: getListInput(nextRequestParams) })
      handleListResponse(lastPageData)
      return
    }

    handleListResponse(data)
  }

  function resetForm() {
    setSelectedCategory(null)
    setSelectedImage(null)
    setEditingGalleryItemId(null)
    setMediaForm(EMPTY_MEDIA_FORM)
    setShowMediaPicker(false)
  }

  function handleBtnEvent(eventName) {
    if (eventName === 'addMediaGalleryItems') {
      setFormMode('add')
      resetForm()
      setShowFormModal(true)
    }
  }

  function handleHeaderEvent(name, value) {
    if (name === 'rows') {
      const nextRequestParams = { ...requestParams, nLimit: Number(value), nSkip: 1 }

      setRequestParams(nextRequestParams)
      appendParams({ nLimit: nextRequestParams.nLimit, nSkip: nextRequestParams.nSkip })
    }
  }

  function handlePageEvent(page) {
    const nextRequestParams = { ...requestParams, nSkip: page }

    setRequestParams(nextRequestParams)
    appendParams({ nSkip: nextRequestParams.nSkip })
  }

  function handleOpenEditForm(item) {
    const category = categories.find((category) => category?._id === item?.oCategory?._id) || item?.oCategory || null

    setFormMode('edit')
    setSelectedCategory(category)
    setSelectedImage(item || null)
    setEditingGalleryItemId(item?._id || null)
    setMediaForm(getMediaFormValues(item))
    setShowFormModal(true)
  }

  function handleMediaData(data) {
    setSelectedImage(data || null)
    setMediaForm(getMediaFormValues(data))
    setShowMediaPicker(false)
  }

  function handleMediaFormChange(event) {
    const { name, value } = event.target
    setMediaForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleRemoveImage() {
    setSelectedImage(null)
    setMediaForm(EMPTY_MEDIA_FORM)
  }

  function handleCloseFormModal() {
    setShowFormModal(false)
    resetForm()
  }

  async function handleSubmitMediaGalleryItem() {
    if (!selectedImage?.sUrl) {
      showToast('Select an image first.')
      return
    }

    if (!selectedCategory?._id) {
      showToast('Select a category first.')
      return
    }

    if (isEditMode && !editingGalleryItemId) {
      showToast('Unable to update media gallery item.')
      return
    }

    const mediaGalleryItemInput = {
      iCategoryId: selectedCategory._id,
      sUrl: selectedImage.sUrl
    }

    if (isEditMode) {
      mediaGalleryItemInput._id = editingGalleryItemId
    }

    try {
      if (selectedImage?._id && hasMediaDetailsChanged(selectedImage, mediaForm)) {
        await editImage({
          variables: {
            input: {
              _id: selectedImage._id,
              sUrl: selectedImage.sUrl,
              sText: mediaForm.sText || '',
              sCaption: mediaForm.sCaption || '',
              sAttribute: mediaForm.sAttribute || ''
            }
          }
        })
      }

      const { data } = await editMediaGalleryItems({
        variables: {
          input: {
            aItems: [mediaGalleryItemInput]
          }
        }
      })

      showToast(data?.editMediaGalleryItems?.sMessage || `Media ${isEditMode ? 'updated' : 'added'} successfully.`, TOAST_TYPE.Success)
      handleCloseFormModal()
      await invalidateMediaGalleryList()
    } catch (error) {
      showToast(error?.message || 'Unable to save media gallery item.')
    }
  }

  function handleDeleteMediaGalleryItem(id) {
    if (!id) return

    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            try {
              const { data } = await updateMediaGalleryItemStatus({
                variables: {
                  input: {
                    _id: id,
                    eStatus: 'd'
                  }
                }
              })

              showToast(data?.updateMediaGalleryItemStatus?.sMessage || 'Media gallery item deleted successfully.', TOAST_TYPE.Success)
              await invalidateMediaGalleryList()
            } catch (error) {
              showToast(error?.message || 'Unable to delete media gallery item.')
            }
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
      <TopBar
        buttons={[
          {
            text: 'Add Media',
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'addMediaGalleryItems',
            isAllowedTo: MEDIA_GALLERY_EDIT_PERMISSIONS
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        columns={columns.current}
        totalRecord={totalRecord.current}
        isLoading={loading}
        header={{
          left: {
            bulkAction: false,
            rows: true
          },
          right: {}
        }}
        headerEvent={handleHeaderEvent}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        actionColumn={canEditMediaGallery}
      >
        {items.map((item) => (
          <MediaGalleryRow
            key={item._id}
            item={item}
            canEdit={canEditMediaGallery}
            isDeleting={isDeletingMediaGalleryItem}
            onDelete={handleDeleteMediaGalleryItem}
            onEdit={handleOpenEditForm}
          />
        ))}
      </DataTable>

      <Modal className="media-modal media-gallery-form-modal" show={showFormModal} onHide={handleCloseFormModal} centered >
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Media Gallery Item' : 'Add Media Gallery Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="media-gallery-editor">
            <div className="media-gallery-editor__details">
              <Form.Group className="form-group">
                <Form.Label>Category*</Form.Label>
                <Select
                  isLoading={categoryLoading}
                  value={selectedCategory}
                  options={categories}
                  getOptionLabel={(option) => option?.sName}
                  getOptionValue={(option) => option?._id}
                  className="react-select"
                  classNamePrefix="select"
                  placeholder="Select category"
                  onChange={setSelectedCategory}
                />
              </Form.Group>
            </div>
            <div className="media-gallery-editor__media-panel">
              <div className="media-gallery-editor__panel-title">Image</div>
              <div className={`media-gallery-editor__preview ${selectedImage?.sUrl ? 'has-media' : ''}`}>
                {selectedImage?.sUrl ? (
                  isSvgMedia(selectedImage.sUrl) ? (
                    <SvgPreview src={selectedImage.sUrl} alt={mediaForm.sText || 'Selected media'} />
                  ) : (
                    <img src={getS3Url(selectedImage.sUrl)} alt={mediaForm.sText || 'Selected media'} />
                  )
                ) : (
                  <Button variant="primary" type="button" onClick={() => setShowMediaPicker(true)}>
                    Media Gallery
                  </Button>
                )}
              </div>
              {selectedImage?.sUrl && (
                <div className="media-gallery-editor__media-actions">
                  <Button variant="outline-secondary" size="sm" type="button" onClick={() => setShowMediaPicker(true)}>
                    Replace Image
                  </Button>
                  <Button variant="outline-secondary" size="sm" type="button" onClick={handleRemoveImage}>
                    Remove
                  </Button>
                </div>
              )}
              <Form.Group className="form-group">
                <Form.Label>Alt Text</Form.Label>
                <Form.Control type="text" name="sText" value={mediaForm.sText} onChange={handleMediaFormChange} />
              </Form.Group>
              <Form.Group className="form-group">
                <Form.Label>Caption</Form.Label>
                <Form.Control as="textarea" name="sCaption" value={mediaForm.sCaption} onChange={handleMediaFormChange} />
              </Form.Group>
              <Form.Group className="form-group mb-0">
                <Form.Label>Attribution</Form.Label>
                <Form.Control as="textarea" name="sAttribute" value={mediaForm.sAttribute} onChange={handleMediaFormChange} />
              </Form.Group>
            </div>
          </Row>
          <MediaGallery show={showMediaPicker} handleHide={() => setShowMediaPicker(false)} handleData={handleMediaData} overRidePermission mediaType="image" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseFormModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitMediaGalleryItem} disabled={isSubmitting}>
            {isEditMode ? 'Update Media' : 'Add Media'}
            {isSubmitting && <Spinner animation="border" size="sm" className="ms-2" />}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

MediaGalleryItems.propTypes = {
  userPermission: PropTypes.array
}

export default MediaGalleryItems
