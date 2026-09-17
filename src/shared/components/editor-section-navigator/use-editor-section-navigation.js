import { useEffect, useState } from 'react'

export default function useEditorSectionNavigation(sections = []) {
  const sectionIds = sections.map((section) => section.id).join('|')
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || '')

  useEffect(() => {
    const availableSectionIds = sectionIds ? sectionIds.split('|').filter(Boolean) : []

    if (!availableSectionIds.includes(activeSectionId)) {
      setActiveSectionId(availableSectionIds[0] || '')
    }
  }, [activeSectionId, sectionIds])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const availableSectionIds = sectionIds ? sectionIds.split('|').filter(Boolean) : []
    const sectionElements = availableSectionIds.map((sectionId) => document.getElementById(sectionId)).filter(Boolean)

    if (!sectionElements.length) return undefined

    const updateActiveSection = () => {
      const activationOffset = window.innerWidth < 576 ? 120 : 150
      const passedSections = sectionElements.filter((element) => element.getBoundingClientRect().top <= activationOffset)
      const upcomingSection = sectionElements.find((element) => element.getBoundingClientRect().top > activationOffset)
      const nextActiveSection = passedSections[passedSections.length - 1] || upcomingSection || sectionElements[0]

      if (nextActiveSection?.id) {
        setActiveSectionId((currentSectionId) => (currentSectionId === nextActiveSection.id ? currentSectionId : nextActiveSection.id))
      }
    }

    const observer = new IntersectionObserver(updateActiveSection, {
      rootMargin: '-120px 0px -55% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    })

    sectionElements.forEach((element) => observer.observe(element))
    updateActiveSection()
    window.addEventListener('resize', updateActiveSection)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [sectionIds])

  function handleJumpToSection(sectionId) {
    const target = document.getElementById(sectionId)

    if (!target) return

    setActiveSectionId(sectionId)
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return {
    activeSectionId,
    handleJumpToSection
  }
}
