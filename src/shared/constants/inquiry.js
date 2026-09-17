export const INQUIRY_TABS = [
  { name: 'Case Study', internalName: 'cs' },
  { name: 'White Paper', internalName: 'wp' },
  { name: 'Research Report', internalName: 'rr' },
  { name: 'Webinar Register', internalName: 'w' },
  { name: 'Webinar Recording', internalName: 'wr' },
  { name: 'Newsletter', internalName: 'nl' }
]

export const DEFAULT_INQUIRY_TYPE = 'nl'
export const DEFAULT_INQUIRY_STATE = ['ur', 'r']

export const INQUIRY_TYPE_LABELS = INQUIRY_TABS.reduce((labels, tab) => {
  labels[tab.internalName] = tab.name
  return labels
}, {})

export const INQUIRY_STATUS_LABELS = {
  r: 'Read',
  ur: 'Unread'
}

export const INQUIRY_FORM_FIELDS = {
  cs: [
    { label: 'Full Name', internalName: 'sFullName', isPrimary: true },
    { label: 'Work Email', internalName: 'sEmail', isEmail: true }
  ],
  wp: [
    { label: 'Full Name', internalName: 'sFullName', isPrimary: true },
    { label: 'Work Email', internalName: 'sEmail', isEmail: true },
    { label: 'Company', internalName: 'sCompanyName' },
    { label: 'Job Title', internalName: 'sJobTitle' }
  ],
  rr: [
    { label: 'Full Name', internalName: 'sFullName', isPrimary: true },
    { label: 'Work Email', internalName: 'sEmail', isEmail: true },
    { label: 'Company', internalName: 'sCompanyName' },
    { label: 'Job Title', internalName: 'sJobTitle' }
  ],
  w: [
    { label: 'Full Name', internalName: 'sFullName', isPrimary: true },
    { label: 'Work Email', internalName: 'sEmail', isEmail: true },
    { label: 'Company', internalName: 'sCompanyName' },
    { label: 'Job Title', internalName: 'sJobTitle' },
    { label: 'Country', internalName: 'sCountry' }
  ],
  wr: [
    { label: 'Full Name', internalName: 'sFullName', isPrimary: true },
    { label: 'Work Email', internalName: 'sEmail', isEmail: true }
  ],
  nl: [{ label: 'Email', internalName: 'sEmail', isPrimary: true, isEmail: true }]
}

export function getValidInquiryType(value) {
  const type = Array.isArray(value) ? value[0] : value
  return INQUIRY_TABS.some((tab) => tab.internalName === type) ? type : DEFAULT_INQUIRY_TYPE
}

export function getInquiryFields(type) {
  return INQUIRY_FORM_FIELDS[getValidInquiryType(type)] || INQUIRY_FORM_FIELDS[DEFAULT_INQUIRY_TYPE]
}

export function getInquiryTypeLabel(type) {
  return INQUIRY_TYPE_LABELS[type] || type || '-'
}
