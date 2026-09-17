import React, { useContext, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'
import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { Button } from 'react-bootstrap'

import MediaGallery from 'shared/components/media-gallery'
import CustomAlert from 'shared/components/alert'
import CountInput from 'shared/components/count-input'
import useModal from 'shared/hooks/useModal'
import { TOAST_TYPE } from 'shared/constants'
import { DELETE_SOCIAL_IMG } from 'graph-ql/add-update-seo/mutation'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ToastrContext } from 'shared/components/toastr'
import { getS3Url } from 'shared/utils'

function Social({ register, errors, values, fbImg, twitterImg, disabled, onUpdateData, defaultData, setValue }) {
  const { id: SeoIid } = useParams()
  const [images, setImages] = useState({ oFB: '', oTwitter: '' })
  const { dispatch } = useContext(ToastrContext)
  const intl = useIntl()
  const selectedSocial = useRef()
  const { isShowing, toggle } = useModal()

  const [deleteImg, { loading }] = useMutation(DELETE_SOCIAL_IMG)

  function handleDeleteImg(eType) {
    confirmAlert({
      title: intl.formatMessage({ id: 'confirmation' }),
      message: intl.formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' }),
      customUI: CustomAlert,
      buttons: [
        {
          label: intl.formatMessage({ id: 'yes' }),
          onClick: async () => {
            const { data } = await deleteImg({ variables: { input: { eType, iId: SeoIid } } })
            handleDeleteImgResponse(data, eType)
          }
        },
        {
          label: intl.formatMessage({ id: 'no' })
        }
      ]
    })
  }

  function handleDeleteImgResponse(data, type) {
    if (data?.deleteSocialImage) {
      onUpdateData &&
        onUpdateData({
          ...defaultData,
          oSeo: {
            ...defaultData?.oSeo,
            [type]: {
              ...defaultData?.oSeo[type],
              sUrl: ''
            }
          }
        })
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data.deleteSocialImage.sMessage, type: TOAST_TYPE.Success }
      })
    }
  }

  function handleImgChange(URL) {
    if (selectedSocial.current) {
      setImages({ ...images, [selectedSocial.current]: URL })
      setValue(`oSeo[${selectedSocial.current}].sUrl`, URL)
      selectedSocial.current = ''
      toggle()
    }
  }

  return (
    <>
      <div className="social">
        <div className="left">
          <h3 className="d-flex align-items-center justify-content-between">
            <FormattedMessage id="facebook" />
            <input type="hidden" name="oSeo.oFB.sUrl" {...register('oSeo.oFB.sUrl')} />
            {/* <input
                    type="file"
                    id="fb-img"
                    accept=".jpg,.png"
                    name="oSeo.oFB.fSUrl"
                    hidden
                    {...facebookPreview}
                    onChange={(e) => {
                      facebookPreview.onChange(e)
                      handleImgChange(e, 'fb')
                    }}
                    disabled={disabled}
                  /> */}
            <div>
              {/* <label htmlFor="fb-img" className={`btn btn-outline-secondary btn-sm ${disabled ? 'disabled' : ''}`}>
                      <FormattedMessage id="setImage" />
                    </label> */}
              <Button
                size="sm"
                variant="outline-secondary"
                disabled={disabled}
                onClick={() => {
                  selectedSocial.current = 'oFB'
                  toggle()
                }}
              >
                <FormattedMessage id="setImage" />
              </Button>
              {(defaultData?.oSeo?.oFB?.sUrl || defaultData?.oFB?.sUrl) && (
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={disabled || loading}
                  className="ms-1"
                  onClick={() => handleDeleteImg('oFB')}
                >
                  <FormattedMessage id="delete" />
                </Button>
              )}
            </div>
          </h3>
          <div className="img-box d-flex align-items-center justify-content-center">
            {images.oFB || fbImg ? (
              <img src={getS3Url(images.oFB || fbImg)} alt="Facebook Preview" className="cover" />
            ) : (
              <i className="icon-add-photo"></i>
            )}
          </div>
        </div>
        <div className="right">
          <CountInput
            maxWord={150}
            currentLength={values?.oSeo?.oFB?.sTitle?.length}
            label={useIntl().formatMessage({ id: 'facebookTitle' })}
            name="oSeo.oFB.sTitle"
            error={errors}
            register={register('oSeo.oFB.sTitle', { maxLength: { value: 150, message: validationErrors.maxLength(150) } })}
            disabled={disabled}
          />
          <CountInput
            textarea
            maxWord={250}
            currentLength={values?.oSeo?.oFB?.sDescription?.length}
            label={useIntl().formatMessage({ id: 'facebookDescription' })}
            name="oSeo.oFB.sDescription"
            error={errors}
            register={register('oSeo.oFB.sDescription', { maxLength: { value: 250, message: validationErrors.maxLength(250) } })}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="social">
        <div className="left">
          <h3 className="d-flex align-items-center justify-content-between">
            <FormattedMessage id="twitter" />
            <input type="hidden" name="oSeo.oTwitter.sUrl" {...register('oSeo.oTwitter.sUrl')} />
            {/* <input
                    type="file"
                    name="oSeo.oTwitter.fSUrl"
                    id="Twitter-img"
                    accept=".jpg,.png"
                    hidden
                    {...twitterPreview}
                    onChange={(e) => {
                      twitterPreview.onChange(e)
                      handleImgChange(e, 'twitter')
                    }}
                    disabled={disabled}
                  /> */}
            <div>
              {/* <label htmlFor="Twitter-img" className={`btn btn-outline-secondary btn-sm ${disabled ? 'disabled' : ''}`}>
                      <FormattedMessage id="setImage" />
                    </label> */}
              <Button
                size="sm"
                variant="outline-secondary"
                disabled={disabled}
                onClick={() => {
                  selectedSocial.current = 'oTwitter'
                  toggle()
                }}
              >
                <FormattedMessage id="setImage" />
              </Button>
              {(defaultData?.oSeo?.oTwitter?.sUrl || defaultData?.oTwitter?.sUrl) && (
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={disabled || loading}
                  className="ms-1"
                  onClick={() => handleDeleteImg('oTwitter')}
                >
                  <FormattedMessage id="delete" />
                </Button>
              )}
            </div>
          </h3>
          <div className="img-box d-flex align-items-center justify-content-center">
            {images.oTwitter || twitterImg ? (
              <img src={getS3Url(images.oTwitter || twitterImg)} alt="Twitter Preview" className="cover" />
            ) : (
              <i className="icon-add-photo"></i>
            )}
          </div>
        </div>
        <div className="right">
          <CountInput
            maxWord={150}
            currentLength={values?.oSeo?.oTwitter?.sTitle?.length}
            label={useIntl().formatMessage({ id: 'twitterTitle' })}
            name="oSeo.oTwitter.sTitle"
            error={errors}
            register={register('oSeo.oTwitter.sTitle', { maxLength: { value: 150, message: validationErrors.maxLength(150) } })}
            disabled={disabled}
          />
          <CountInput
            textarea
            maxWord={250}
            currentLength={values?.oSeo?.oTwitter?.sDescription?.length}
            label={useIntl().formatMessage({ id: 'twitterDescription' })}
            name="oSeo.oTwitter.sDescription"
            error={errors}
            register={register('oSeo.oTwitter.sDescription', { maxLength: { value: 250, message: validationErrors.maxLength(250) } })}
            disabled={disabled}
          />
        </div>
      </div>
      <MediaGallery
        galleryType="kcdfi"
        show={isShowing}
        overRidePermission
        handleHide={toggle}
        handleData={(e) => {
          handleImgChange(e.sUrl)
        }}
      />
    </>
  )
}
export default Social
Social.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  values: PropTypes.object,
  defaultData: PropTypes.object,
  setValue: PropTypes.func,
  onUpdateData: PropTypes.func,
  fbImg: PropTypes.string,
  twitterImg: PropTypes.string,
  disabled: PropTypes.bool
}
