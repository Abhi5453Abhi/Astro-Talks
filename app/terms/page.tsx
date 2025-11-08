const sections = [
  {
    title: 'Acceptance of Terms',
    body: [
      'By accessing Astro Talks, you agree to these Terms and any future revisions published on this page.',
      'If you do not agree, please discontinue use immediately. Continued use after changes take effect counts as acceptance.',
    ],
  },
  {
    title: 'Service Overview',
    body: [
      'Astro Talks provides digital astrology guidance and chat-based consultations. No medical, legal, or financial advice is offered.',
      'Outcomes are based on astrological interpretations and should be used for personal reflection, not as definitive predictions or guarantees.',
    ],
  },
  {
    title: 'User Responsibilities',
    body: [
      'Ensure the personal details you provide (birth information, contact data) are accurate and belong to you.',
      'Use respectful language when interacting with our astrologers and support team. Abusive behaviour may result in suspension or termination without refund.',
      'You must be at least 18 years old or have parental consent to use paid services.',
    ],
  },
  {
    title: 'Payments & Credits',
    body: [
      'Paid sessions are billed in advance via Razorpay or other supported payment partners.',
      'Refunds follow our Cancellation & Refund Policy. Chargebacks for completed consultations may lead to account suspension.',
      'Promotional credits or free minutes have expiry dates that will be communicated at the time of issue.',
    ],
  },
  {
    title: 'Intellectual Property',
    body: [
      'All content, branding, illustrations, and code underlying Astro Talks belong to Astro Talks or its licensors.',
      'You may not copy, resell, or redistribute platform content without written permission.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'Astro Talks is provided on an “as-is” basis. To the fullest extent permitted by law, we disclaim liability for indirect, incidental, or consequential damages.',
      'Our maximum aggregate liability for any claim shall not exceed the amount paid by you for the service in the preceding 30 days.',
    ],
  },
  {
    title: 'Governing Law',
    body: [
      'These Terms are governed by the laws of the Republic of India. Disputes will be subject to the exclusive jurisdiction of the courts in New Delhi, India.',
    ],
  },
]

export const metadata = {
  title: 'Terms & Conditions | Astro Talks',
  description: 'Read the Terms and Conditions governing your use of Astro Talks services.',
}

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16 text-slate-100">
      <header className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Last updated: 8 Nov 2025
        </p>
        <h1 className="text-4xl font-semibold">Terms &amp; Conditions</h1>
        <p className="text-slate-300">
          These Terms describe your rights, responsibilities, and the rules that apply when using Astro Talks.
        </p>
      </header>

      <section className="space-y-8">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-2xl bg-slate-900/60 p-6 shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/20 backdrop-blur"
          >
            <h2 className="text-2xl font-semibold text-purple-200">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-3 leading-relaxed text-slate-200">
              {section.body.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <footer className="rounded-2xl bg-purple-900/20 p-6 text-sm leading-relaxed text-purple-100 ring-1 ring-purple-500/20">
        <p>
          Questions about these Terms? Email{' '}
          <a
            href="mailto:support@astro-talks.app"
            className="font-medium text-purple-200 underline underline-offset-4"
          >
            support@astro-talks.app
          </a>{' '}
          and we will help you within 3 working days.
        </p>
      </footer>
    </main>
  )
}


