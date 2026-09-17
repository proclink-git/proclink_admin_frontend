import React, { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@apollo/client'
import { Form, Button, Spinner } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'

import { ToastrContext } from 'shared/components/toastr'
import { getPreSignedData, uploadImage } from 'shared/functions/PreSignedData'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { HEADER_CATEGORY_SLUG_ADMIN, META_ROBOTS, TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import AuthorEdit from 'shared/components/author-page/author-edit'
import { GET_AUTHOR_BY_ID } from 'graph-ql/author/query'
import CommonSEO from 'shared/components/common-seo'
import { CREATE_AUTHOR_PAGE, EDIT_AUTHOR_PAGE } from 'graph-ql/author/mutation'
import { removeTypenameKey } from 'shared/utils'

function AddEditAuthor() {
  const { id, categoryType } = useParams()
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const [profileData, setProfileData] = useState({})
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const defaultURL = 'leadership-team/'

  const {
    register,
    control,
    formState: { errors },
    clearErrors,
    trigger,
    getValues,
    reset,
    handleSubmit,
    setValue,
    setError
  } = useForm({
    mode: 'all',
    defaultValues: {
      sUrl: '',
      oSeo: { eType: 'p' },
      aSocialProfiles: [{ eSocialNetworkType: '', sLink: '' }]
    }
  })

  const { loading } = useQuery(GET_AUTHOR_BY_ID, {
    variables: { input: { _id: id, eHeaderCategoryType: categoryType, eAuthorType: categoryType === 'b' ? 'a' : 's' } },
    skip: !id,
    onCompleted: (data) => {
      if (data && data.getAuthor) {
        setDataInForm(data.getAuthor)
        setProfileData(data.getAuthor)
      }
    }
  })

  function handleChange(newValue) {
    setProfileData({ ...profileData, sUrl: newValue })
  }

  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED, {
    onCompleted: (data) => {
      if (data) {
        let urls = data.generatePreSignedUrl
        const allData = formData
        urls = urls.map((item) => {
          const key = allData[item.sType].key
          key.includes('.') ? (allData[key.split('.')[0]][key.split('.')[1]] = item.sS3Url) : (allData[key] = item.sS3Url)
          return {
            ...item,
            file: allData[item.sType].file
          }
        })
        uploadImage(urls)
          .then((res) => {
            prepareEditProfile(allData)
            setIsLoading(false)
          })
          .catch((err) => {
            setIsLoading(false)
            console.log('err', err)
          })
      }
    }
  })

  const setDataInForm = (profileData) => {
    if (profileData) {
      let aSLinks
      if (profileData?.aSLinks?.length) {
        aSLinks = profileData.aSLinks.map((item) => {
          return { eSocialNetworkType: item.eSocialNetworkType, sLink: item.sLink }
        })
      }
      reset({
        sUrl: '',
        sFName: profileData.sFName,
        sNumber: profileData.sNumber,
        eGender: profileData.eGender,
        sEmail: profileData.sEmail,
        sBio: profileData.sBio,
        eDesignation: profileData.eDesignation || '',
        aSocialProfiles: profileData?.aSLinks?.length ? aSLinks : [{ eSocialNetworkType: '', sLink: '' }],
        oSeo: {
          eType: 'a',
          ...removeTypenameKey(profileData?.oSeo),
          sSlug: profileData?.oSeo?.sSlug?.substring(profileData.oSeo.sSlug.lastIndexOf('/') + 1),
          sRobots: profileData?.oSeo?.sRobots || META_ROBOTS[0],
          aKeywords: profileData?.oSeo?.aKeywords ? profileData.oSeo.aKeywords.join(', ') : ''
        }
      })
    }
  }

  const editProfile = (formValue) => {
    const { value, data } = getPreSignedData(formValue)
    setFormData(data)
    if (data.sUrl && data.sUrl.files[0] instanceof File) {
      setIsLoading(true)
      generatePreSignedUrl({ variables: { generatePreSignedUrlInput: value } })
    } else {
      prepareEditProfile(data)
    }
  }

  const prepareEditProfile = (value) => {
    const data = value
    delete data.profile
    if (data.sUrl === '') {
      data.sUrl = profileData.sUrl || ''
    }
    if (data.aSocialProfiles.length && data.aSocialProfiles[data.aSocialProfiles.length - 1].sLink === '') {
      data.aSocialProfiles.length = data.aSocialProfiles.length - 1
    }
    data.aSLinks = data.aSocialProfiles
    delete data.aSocialProfiles
    data.eDesignation = data?.eDesignation?.trim?.() || ''
    data.oSeo.sSlug = `${defaultURL}${data.oSeo?.sSlug}`
    data.eHeaderCategoryType = categoryType
    data.eAuthorType = categoryType === 'b' ? 'a' : 's'
    if (id) {
      data._id = id
      editProfileMutation({ variables: { input: data } })
    } else {
      create({ variables: { input: data } })
    }
  }

  const [editProfileMutation, { loading: editProfileLoading }] = useMutation(EDIT_AUTHOR_PAGE, {
    onCompleted: (data) => {
      if (data && data.editAuthor) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editAuthor.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        history.push(categoryType === 'b' ? allRoutes.authorsList(categoryType) : `/${HEADER_CATEGORY_SLUG_ADMIN[categoryType]}/speakers/${categoryType}`)
      }
    }
  })

  const [create, { loading: createLoading }] = useMutation(CREATE_AUTHOR_PAGE, {
    onCompleted: (data) => {
      if (data && data.createAuthor) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.createAuthor.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        history.push(categoryType === 'b' ? allRoutes.authorsList(categoryType) : `/${HEADER_CATEGORY_SLUG_ADMIN[categoryType]}/speakers/${categoryType}`)
      }
    }
  })

  return (
    <>
      <div className="edit-profile">
        <Form onSubmit={handleSubmit(editProfile)} autoComplete="off">
          <AuthorEdit
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            trigger={trigger}
            values={getValues()}
            sProfilePicture={profileData.sUrl}
            profileData={profileData}
            handleChange={(e) => handleChange(e)}
            setValue={setValue}
          />
          {categoryType === 'b' && (
            <div className="add-border">
              <input type="hidden" {...register('oSeo.eType')} value="p" />
              <CommonSEO
                register={register}
                errors={errors}
                values={getValues()}
                setError={setError}
                clearErrors={clearErrors}
                previewURL={profileData?.oSeo?.oFB?.sUrl || profileData?.oSeo?.oTwitter?.sUrl || profileData?.oImg?.sUrl}
                fbImg={profileData?.oSeo?.oFB?.sUrl || profileData?.oImg?.sUrl}
                twitterImg={profileData?.oSeo?.oTwitter?.sUrl || profileData?.oImg?.sUrl}
                setValue={setValue}
                control={control}
                id={id}
                slugType={'a'}
                // slug={title && defaultURL ? `${defaultURL}${title}` : title || undefined}
                hidden
                // defaultData={categoryData}
                categoryURL={defaultURL}
                // onUpdateData={(e) => handleUpdateData(e)}
              />
            </div>
          )}
          <div className="add-border">
            <Button variant="primary" type="submit" className="m-2" disabled={loading || isLoading || editProfileLoading || createLoading}>
              {id ? 'Update' : 'Create'}{' '}
              {(loading || isLoading || editProfileLoading || createLoading) && <Spinner animation="border" size="sm" />}
            </Button>
          </div>
        </Form>
      </div>
    </>
  )
}

export default AddEditAuthor
