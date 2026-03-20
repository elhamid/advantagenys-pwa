import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FAQSection } from '../FAQSection'

const sampleFaqs = [
  { question: 'What is an ITIN?', answer: 'An Individual Taxpayer Identification Number issued by the IRS.' },
  { question: 'How long does LLC formation take?', answer: 'Typically a few business days in New York.' },
  { question: 'Do you offer free consultations?', answer: 'Yes, we offer free initial consultations.' },
]

describe('FAQSection', () => {
  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  it('renders nothing when faqs array is empty', () => {
    const { container } = render(<FAQSection faqs={[]} />)
    expect(container.firstChild).toBeNull()
  })

  // ---------------------------------------------------------------------------
  // Rendering with items
  // ---------------------------------------------------------------------------
  it('renders all FAQ questions when faqs are provided', () => {
    render(<FAQSection faqs={sampleFaqs} />)
    for (const faq of sampleFaqs) {
      expect(screen.getByText(faq.question)).toBeTruthy()
    }
  })

  it('renders the default title "Frequently Asked Questions"', () => {
    render(<FAQSection faqs={sampleFaqs} />)
    expect(screen.getByText('Frequently Asked Questions')).toBeTruthy()
  })

  it('renders a custom title when provided', () => {
    render(<FAQSection faqs={sampleFaqs} title="Common Questions About Taxes" />)
    expect(screen.getByText('Common Questions About Taxes')).toBeTruthy()
    expect(screen.queryByText('Frequently Asked Questions')).toBeNull()
  })

  // ---------------------------------------------------------------------------
  // Accordion — open / close behaviour
  // ---------------------------------------------------------------------------
  it('answers are not visible before any item is clicked', () => {
    render(<FAQSection faqs={sampleFaqs} />)
    for (const faq of sampleFaqs) {
      expect(screen.queryByText(faq.answer)).toBeNull()
    }
  })

  it('shows the answer when a question button is clicked', () => {
    render(<FAQSection faqs={sampleFaqs} />)
    fireEvent.click(screen.getByText(sampleFaqs[0].question))
    expect(screen.getByText(sampleFaqs[0].answer)).toBeTruthy()
  })

  it('hides the answer when the same question is clicked again (toggle close)', () => {
    render(<FAQSection faqs={sampleFaqs} />)
    const btn = screen.getByText(sampleFaqs[0].question)
    fireEvent.click(btn) // open
    expect(screen.getByText(sampleFaqs[0].answer)).toBeTruthy()
    fireEvent.click(btn) // close
    expect(screen.queryByText(sampleFaqs[0].answer)).toBeNull()
  })

  it('closes the previously open item when a new one is clicked', () => {
    render(<FAQSection faqs={sampleFaqs} />)
    fireEvent.click(screen.getByText(sampleFaqs[0].question))
    expect(screen.getByText(sampleFaqs[0].answer)).toBeTruthy()

    fireEvent.click(screen.getByText(sampleFaqs[1].question))
    // First answer should now be hidden, second visible
    expect(screen.queryByText(sampleFaqs[0].answer)).toBeNull()
    expect(screen.getByText(sampleFaqs[1].answer)).toBeTruthy()
  })

  it('only reveals the answer of the clicked item, not others', () => {
    render(<FAQSection faqs={sampleFaqs} />)
    fireEvent.click(screen.getByText(sampleFaqs[1].question))
    expect(screen.getByText(sampleFaqs[1].answer)).toBeTruthy()
    expect(screen.queryByText(sampleFaqs[0].answer)).toBeNull()
    expect(screen.queryByText(sampleFaqs[2].answer)).toBeNull()
  })

  // ---------------------------------------------------------------------------
  // FAQ JSON-LD embedded in the component
  // ---------------------------------------------------------------------------
  it('embeds a script tag with type="application/ld+json"', () => {
    const { container } = render(<FAQSection faqs={sampleFaqs} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
  })

  it('JSON-LD script contains valid, parseable JSON', () => {
    const { container } = render(<FAQSection faqs={sampleFaqs} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(() => JSON.parse(script!.innerHTML)).not.toThrow()
  })

  it('JSON-LD has @type FAQPage', () => {
    const { container } = render(<FAQSection faqs={sampleFaqs} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const data = JSON.parse(script!.innerHTML)
    expect(data['@type']).toBe('FAQPage')
    expect(data['@context']).toBe('https://schema.org')
  })

  it('JSON-LD mainEntity includes all FAQ questions and answers', () => {
    const { container } = render(<FAQSection faqs={sampleFaqs} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const data = JSON.parse(script!.innerHTML)
    expect(data.mainEntity).toHaveLength(sampleFaqs.length)
    for (const [i, entity] of data.mainEntity.entries()) {
      expect(entity['@type']).toBe('Question')
      expect(entity.name).toBe(sampleFaqs[i].question)
      expect(entity.acceptedAnswer.text).toBe(sampleFaqs[i].answer)
    }
  })
})
