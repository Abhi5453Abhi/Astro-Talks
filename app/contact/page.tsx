const contactMethods = [
  {
    title: 'Email Support',
    detail: 'support@astro-talks.app',
    description:
      'Reach out with any product, billing, or privacy questions. We aim to respond within 24 hours on business days.',
    link: 'mailto:support@astro-talks.app',
  },
  {
    title: 'Customer Care Hours',
    detail: 'Monday – Saturday, 10:00 AM to 8:00 PM IST',
    description:
      'Messages received outside these hours will be answered on the next working day.',
  },
  {
    title: 'Registered Office',
    detail: 'Astro Talks Technologies Pvt. Ltd.',
    description:
      '91springboard, Sector 18, Gurugram, Haryana 122015, India',
  },
]

export const metadata = {
  title: 'Contact Us | Astro Talks',
  description:
    'Get in touch with Astro Talks support for questions about consultations, payments, or policies.',
}

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16 text-slate-100">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-semibold">Contact Astro Talks</h1>
        <p className="text-slate-300">
          Our support team is ready to help with account, billing, or product questions. Use the details below to reach us quickly.
        </p>
      </header>

      <section className="space-y-6">
        {contactMethods.map((method) => (
          <article
            key={method.title}
            className="rounded-2xl bg-slate-900/60 p-6 shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/20 backdrop-blur"
          >
            <h2 className="text-2xl font-semibold text-purple-200">
              {method.title}
            </h2>
            <p className="mt-2 text-lg font-medium text-slate-100">
              {method.link ? (
                <a
                  href={method.link}
                  className="underline underline-offset-4 transition hover:text-purple-200"
                >
                  {method.detail}
                </a>
              ) : (
                method.detail
              )}
            </p>
            <p className="mt-2 leading-relaxed text-slate-200">
              {method.description}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl bg-purple-900/20 p-6 text-sm leading-relaxed text-purple-100 ring-1 ring-purple-500/20">
        <p>
          For urgent payment disputes, mention your transaction ID in the subject line so we can prioritise the response. 
          We never ask for your card PIN or OTP—please ignore and report any such request.
        </p>
      </section>
    </main>
  )
}


