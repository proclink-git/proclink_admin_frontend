export const getPreSignedData = (data, type) => {
  const value = []
  if (type && data.oImg && data.oImg.fSUrl && data.oImg.fSUrl.files && data.oImg.fSUrl.files[0] instanceof File) {
    value.push({
      sFileName: data.oImg.fSUrl.files[0].name.split('.')[0],
      sContentType: data.oImg.fSUrl.files[0].type,
      sType: type
    })
    data.category = {
      file: data.oImg.fSUrl.files[0],
      sType: type,
      key: 'oImg.sUrl'
    }
  }
  if (data.sProfilePicture && data.sProfilePicture.files && data.sProfilePicture.files[0] instanceof File) {
    value.push({
      sFileName: data.sProfilePicture.files[0].name.split('.')[0],
      sContentType: data.sProfilePicture.files[0].type,
      sType: 'profile'
    })
    data.profile = {
      file: data.sProfilePicture.files[0],
      sType: 'profile',
      key: 'sProfilePicture'
    }
  }
  if (data.sUrl && data.sUrl.files && data.sUrl.files[0] instanceof File) {
    value.push({
      sFileName: data.sUrl.files[0].name.split('.')[0],
      sContentType: data.sUrl.files[0].type,
      sType: 'profile'
    })
    data.profile = {
      file: data.sUrl.files[0],
      sType: 'profile',
      key: 'sUrl'
    }
  }
  if (data.sPanPicture && data.sPanPicture[0] instanceof File) {
    value.push({
      sFileName: data.sPanPicture[0].name.split('.')[0],
      sContentType: data.sPanPicture[0].type,
      sType: 'pan'
    })
    data.pan = {
      file: data.sPanPicture[0],
      sType: 'pan',
      key: 'sPanPicture'
    }
  }
  if (data.oFB && data.oFB.fSUrl && data.oFB.fSUrl[0] instanceof File) {
    value.push({
      sFileName: data.oFB.fSUrl[0].name.split('.')[0],
      sContentType: data.oFB.fSUrl[0].type,
      sType: 'fb'
    })
    data.fb = {
      file: data.oFB.fSUrl[0],
      sType: 'fb',
      key: 'oFB.sUrl'
    }
  }
  if (data.oTwitter && data.oTwitter.fSUrl && data.oTwitter.fSUrl[0] instanceof File) {
    value.push({
      sFileName: data.oTwitter.fSUrl[0].name.split('.')[0],
      sContentType: data.oTwitter.fSUrl[0].type,
      sType: 'twitter'
    })
    data.twitter = {
      file: data.oTwitter.fSUrl[0],
      sType: 'twitter',
      key: 'oTwitter.sUrl'
    }
  }
  if (!type && data.oImg && data.oImg.fSUrl && data.oImg.fSUrl.files && data.oImg.fSUrl.files[0] instanceof File) {
    value.push({
      sFileName: data.oImg.fSUrl.files[0].name.split('.')[0],
      sContentType: data.oImg.fSUrl.files[0].type,
      sType: 'articleFtImg'
    })
    data.articleFtImg = {
      file: data.oImg.fSUrl.files[0],
      sType: 'articleFtImg',
      key: 'oImg.sUrl'
    }
  }
  if (data.oTImg && data.oTImg.fSUrl && data.oTImg.fSUrl.files && data.oTImg.fSUrl.files[0] instanceof File) {
    value.push({
      sFileName: data.oTImg.fSUrl.files[0].name.split('.')[0],
      sContentType: data.oTImg.fSUrl.files[0].type,
      sType: 'articleThumbImg'
    })
    data.articleThumbImg = {
      file: data.oTImg.fSUrl.files[0],
      sType: 'articleThumbImg',
      key: 'oImg.sUrl'
    }
  }
  if (data.articleChat && data.articleChat[0] instanceof File) {
    data.articleChatMedia = []
    for (let i = 0; i < data.articleChat.length; ++i) {
      value.push({
        sFileName: data.articleChat[i].name.split('.')[0],
        sContentType: data.articleChat[i].type,
        sType: 'articleChatMedia'
      })
      data.articleChatMedia.push({
        file: data.articleChat[i],
        sType: 'articleChatMedia',
        key: 'oImg.sUrl'
      })
    }
  }
  if (data.sBankDetailPic && data.sBankDetailPic[0] instanceof File) {
    value.push({
      sFileName: data.sBankDetailPic[0].name.split('.')[0],
      sContentType: data.sBankDetailPic[0].type,
      sType: 'bank'
    })
    data.bank = {
      file: data.sBankDetailPic[0],
      sType: 'bank',
      key: 'sBankDetailPic'
    }
  }
  return { value, data }
}

export const uploadImage = (data) => {
  return Promise.all(
    data.map(async (item) => {
      const headers = {}
      const contentType = item.sContentType || item.file?.type

      if (contentType) headers['Content-Type'] = contentType

      const response = await fetch(item.sUploadUrl, { method: 'put', body: item.file, headers })

      if (!response.ok) {
        throw new Error('Media upload failed.')
      }

      return response
    })
  )
}
