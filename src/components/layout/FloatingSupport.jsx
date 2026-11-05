import { useState } from 'react'

const whatsappNumber = '923146566440'
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Rahman Fabrics, I have a question about an order.')}`

const faqs = [
  {
    question: 'What fabric types do you offer?',
    answer: 'Our collection includes lawn, cotton, cambric, khaddar, organza and chiffon. Fabric details are listed on each product page.',
  },
  {
    question: 'How is the fabric quality?',
    answer: 'We offer carefully selected branded fabrics. Each product page describes its fabric and finish; contact us on WhatsApp if you need more details about a specific article.',
  },
  {
    question: 'How many pieces are included?',
    answer: 'Piece count is shown on each product. Most current articles are unstitched 3-piece suits; please check the product listing for exact details.',
  },
  {
    question: 'What sizes are available?',
    answer: 'Our listed suits are unstitched fabric and do not have ready-made garment sizes. Please check the piece details on the product page.',
  },
  {
    question: 'What colors are available?',
    answer: 'Colors and prints vary by article and are shown in the product photos. Message us on WhatsApp to confirm current availability.',
  },
  {
    question: 'How much do the products cost?',
    answer: 'Current prices are shown on each product card and product page. Delivery is Rs. 500 and may be negotiated according to your location/address; contact us on WhatsApp to discuss the charge.',
  },
  {
    question: 'Is an article available?',
    answer: 'Availability is shown on the product page and may change. Contact us on WhatsApp to confirm stock before ordering.',
  },
  {
    question: 'When will my order be delivered?',
    answer: 'Delivery timing depends on rider availability. We will confirm delivery details with you after your order.',
  },
  {
    question: 'Which payment methods do you accept?',
    answer: 'Cash on Delivery is available. Online payment can be arranged by contacting us on WhatsApp; online payment is not processed directly through this checkout.',
  },
  {
    question: 'Can I return an item?',
    answer: 'No returns are accepted.',
  },
  {
    question: 'Can I exchange an item?',
    answer: 'Exchanges are available only for specific eligible items. Please contact us before ordering to confirm whether an item qualifies.',
  },
  {
    question: 'How do I place an order?',
    answer: 'Add items to your bag and complete checkout for Cash on Delivery, or contact us on WhatsApp to order or arrange online payment.',
  },
]

export default function FloatingSupport() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState(null)

  return (
    <div className="floating-support">
      {isChatOpen && (
        <section className="support-chat" aria-label="Rahman Fabrics help chat">
          <div className="support-chat-heading">
            <span className="support-chat-avatar" aria-hidden="true">R</span>
            <div>
              <strong>Rahman Fabrics</strong>
              <small>We’re here to help</small>
            </div>
            <button type="button" onClick={() => setIsChatOpen(false)} aria-label="Close help chat">×</button>
          </div>
          <div className="support-chat-content" aria-live="polite">
            <p className="support-message">Assalamu alaikum! Choose a question and we’ll help you out.</p>
            {selectedFaq && (
              <>
                <p className="support-message support-question">{selectedFaq.question}</p>
                <p className="support-message support-answer">{selectedFaq.answer}</p>
              </>
            )}
            <p className="support-faq-label">Frequently asked questions</p>
            <div className="support-faq-list">
              {faqs.map((faq) => (
                <button
                  type="button"
                  key={faq.question}
                  className={selectedFaq?.question === faq.question ? 'is-selected' : ''}
                  onClick={() => setSelectedFaq(faq)}
                >
                  {faq.question}
                </button>
              ))}
            </div>
            <a className="support-chat-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
              Chat with us on WhatsApp
            </a>
          </div>
        </section>
      )}
      <a
        className="floating-support-button floating-whatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Contact Rahman Fabrics on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.75L7.1 20.5A10 10 0 1 0 12.04 2Zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-2.85.75.76-2.78-.2-.3a8.1 8.1 0 1 1 6.72 3.64Zm4.45-6.07c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.15 1.51.09.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
        </svg>
      </a>
      <button
        className="floating-support-button floating-chat-toggle"
        type="button"
        onClick={() => setIsChatOpen((open) => !open)}
        aria-label={isChatOpen ? 'Close help chat' : 'Open help chat'}
        aria-expanded={isChatOpen}
        title="Ask a question"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6a7.5 7.5 0 1 1 17-3.5Z" />
          <path d="M8 11h.01M12 11h.01M16 11h.01" />
        </svg>
      </button>
    </div>
  )
}
