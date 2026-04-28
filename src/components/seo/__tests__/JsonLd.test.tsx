import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { JsonLd } from '../JsonLd'

describe('JsonLd', () => {
  // ---------------------------------------------------------------------------
  // Helper: render component, grab the script tag, parse its JSON content
  // ---------------------------------------------------------------------------
  function getScriptData(ui: React.ReactElement) {
    const { container } = render(ui)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    return JSON.parse(script!.innerHTML)
  }

  // ---------------------------------------------------------------------------
  // script tag attributes
  // ---------------------------------------------------------------------------
  it('renders a script tag with type="application/ld+json"', () => {
    const { container } = render(<JsonLd type="LocalBusiness" />)
    const script = container.querySelector('script')
    expect(script).not.toBeNull()
    expect(script!.getAttribute('type')).toBe('application/ld+json')
  })

  it('renders valid, parseable JSON', () => {
    const { container } = render(<JsonLd type="LocalBusiness" />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(() => JSON.parse(script!.innerHTML)).not.toThrow()
  })

  // ---------------------------------------------------------------------------
  // LocalBusiness
  // ---------------------------------------------------------------------------
  describe('LocalBusiness', () => {
    it('sets @context and @type correctly', () => {
      const data = getScriptData(<JsonLd type="LocalBusiness" />)
      expect(data['@context']).toBe('https://schema.org')
      expect(data['@type']).toBe('LocalBusiness')
    })

    it('includes business name "Advantage Services"', () => {
      const data = getScriptData(<JsonLd type="LocalBusiness" />)
      expect(data.name).toBe('Advantage Services')
    })

    it('includes telephone and email', () => {
      const data = getScriptData(<JsonLd type="LocalBusiness" />)
      expect(data.telephone).toBe('+19299331396')
      expect(data.email).toBe('info@advantagenys.com')
    })

    it('includes a PostalAddress with correct fields', () => {
      const data = getScriptData(<JsonLd type="LocalBusiness" />)
      expect(data.address['@type']).toBe('PostalAddress')
      expect(data.address.streetAddress).toBe('229-14 Linden Blvd')
      expect(data.address.addressLocality).toBe('Cambria Heights')
      expect(data.address.addressRegion).toBe('NY')
      expect(data.address.postalCode).toBe('11411')
      expect(data.address.addressCountry).toBe('US')
    })

    it('includes GeoCoordinates', () => {
      const data = getScriptData(<JsonLd type="LocalBusiness" />)
      expect(data.geo['@type']).toBe('GeoCoordinates')
      expect(typeof data.geo.latitude).toBe('number')
      expect(typeof data.geo.longitude).toBe('number')
    })

    it('includes opening hours specification', () => {
      const data = getScriptData(<JsonLd type="LocalBusiness" />)
      const hours = data.openingHoursSpecification
      expect(hours['@type']).toBe('OpeningHoursSpecification')
      expect(hours.opens).toBe('10:00')
      expect(hours.closes).toBe('19:00')
      expect(Array.isArray(hours.dayOfWeek)).toBe(true)
      expect(hours.dayOfWeek).toContain('Monday')
      expect(hours.dayOfWeek).toContain('Saturday')
    })

    it('includes areaServed array with Queens', () => {
      const data = getScriptData(<JsonLd type="LocalBusiness" />)
      expect(Array.isArray(data.areaServed)).toBe(true)
      expect(data.areaServed).toContain('Queens')
    })
  })

  // ---------------------------------------------------------------------------
  // Service
  // ---------------------------------------------------------------------------
  describe('Service', () => {
    const serviceProps = {
      type: 'Service' as const,
      serviceName: 'Tax Preparation',
      serviceDescription: 'Professional tax prep for individuals and businesses.',
      serviceUrl: 'https://advantagenys.com/services/tax-services',
    }

    it('sets @context and @type correctly', () => {
      const data = getScriptData(<JsonLd {...serviceProps} />)
      expect(data['@context']).toBe('https://schema.org')
      expect(data['@type']).toBe('Service')
    })

    it('maps serviceName to name', () => {
      const data = getScriptData(<JsonLd {...serviceProps} />)
      expect(data.name).toBe(serviceProps.serviceName)
    })

    it('maps serviceDescription to description', () => {
      const data = getScriptData(<JsonLd {...serviceProps} />)
      expect(data.description).toBe(serviceProps.serviceDescription)
    })

    it('maps serviceUrl to url', () => {
      const data = getScriptData(<JsonLd {...serviceProps} />)
      expect(data.url).toBe(serviceProps.serviceUrl)
    })

    it('includes a LocalBusiness provider named "Advantage Services"', () => {
      const data = getScriptData(<JsonLd {...serviceProps} />)
      expect(data.provider['@type']).toBe('LocalBusiness')
      expect(data.provider.name).toBe('Advantage Services')
    })

    it('includes areaServed', () => {
      const data = getScriptData(<JsonLd {...serviceProps} />)
      expect(data.areaServed).toBeTruthy()
    })
  })

  // ---------------------------------------------------------------------------
  // FAQPage
  // ---------------------------------------------------------------------------
  describe('FAQPage', () => {
    const faqs = [
      { question: 'What is an ITIN?', answer: 'An Individual Taxpayer Identification Number.' },
      { question: 'How long does LLC formation take?', answer: 'Typically a few business days.' },
    ]

    it('sets @context and @type correctly', () => {
      const data = getScriptData(<JsonLd type="FAQPage" faqs={faqs} />)
      expect(data['@context']).toBe('https://schema.org')
      expect(data['@type']).toBe('FAQPage')
    })

    it('mainEntity contains an entry per FAQ', () => {
      const data = getScriptData(<JsonLd type="FAQPage" faqs={faqs} />)
      expect(Array.isArray(data.mainEntity)).toBe(true)
      expect(data.mainEntity).toHaveLength(faqs.length)
    })

    it('each mainEntity item has @type Question and name/acceptedAnswer', () => {
      const data = getScriptData(<JsonLd type="FAQPage" faqs={faqs} />)
      for (const [i, item] of data.mainEntity.entries()) {
        expect(item['@type']).toBe('Question')
        expect(item.name).toBe(faqs[i].question)
        expect(item.acceptedAnswer['@type']).toBe('Answer')
        expect(item.acceptedAnswer.text).toBe(faqs[i].answer)
      }
    })

    it('renders valid JSON with an empty faqs array', () => {
      const data = getScriptData(<JsonLd type="FAQPage" faqs={[]} />)
      expect(data.mainEntity).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // BreadcrumbList
  // ---------------------------------------------------------------------------
  describe('BreadcrumbList', () => {
    const items = [
      { name: 'Home', url: 'https://advantagenys.com' },
      { name: 'Services', url: 'https://advantagenys.com/services' },
      { name: 'Tax Services', url: 'https://advantagenys.com/services/tax-services' },
    ]

    it('sets @context and @type correctly', () => {
      const data = getScriptData(<JsonLd type="BreadcrumbList" items={items} />)
      expect(data['@context']).toBe('https://schema.org')
      expect(data['@type']).toBe('BreadcrumbList')
    })

    it('itemListElement has one entry per item', () => {
      const data = getScriptData(<JsonLd type="BreadcrumbList" items={items} />)
      expect(Array.isArray(data.itemListElement)).toBe(true)
      expect(data.itemListElement).toHaveLength(items.length)
    })

    it('each itemListElement has correct @type, position, name, and item', () => {
      const data = getScriptData(<JsonLd type="BreadcrumbList" items={items} />)
      for (const [i, el] of data.itemListElement.entries()) {
        expect(el['@type']).toBe('ListItem')
        expect(el.position).toBe(i + 1)
        expect(el.name).toBe(items[i].name)
        expect(el.item).toBe(items[i].url)
      }
    })

    it('positions are 1-indexed', () => {
      const data = getScriptData(<JsonLd type="BreadcrumbList" items={items} />)
      expect(data.itemListElement[0].position).toBe(1)
      expect(data.itemListElement[items.length - 1].position).toBe(items.length)
    })
  })
})
