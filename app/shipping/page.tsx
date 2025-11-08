const policies = [
  {
    title: 'Digital Delivery Only',
    description:
      'Astro Talks provides astrology consultations and reports digitally. There is no physical product shipment.',
  },
  {
    title: 'Access to Sessions',
    description:
      'After successful payment, live chat sessions start instantly or at the scheduled slot inside the Astro Talks platform.',
  },
  {
    title: 'Report Turnaround',
    description:
      'If your consultation includes a written report, it will be delivered to your registered email within 24 hours unless otherwise stated.',
  },
  {
    title: 'Delivery Delays',
    description:
      'In the rare event of a delay caused by technical or astrologer availability issues, we will notify you by email/SMS with the revised delivery time.',
  },
  {
    title: 'Support',
    description:
      'For any delivery questions, reach out to support@astro-talks.app with your registered mobile number or payment reference.',
  },
]

export const metadata = {
  title: 'Shipping & Delivery Policy | Astro Talks',
  description:
    'Understand how Astro Talks delivers digital astrology consultations and reports after purchase.',
}

export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16 text-slate-100">
      <header className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Last updated: 8 Nov 2025
        </p>
        <h1 className="text-4xl font-semibold">Shipping &amp; Delivery Policy</h1>
        <p className="text-slate-300">
          Our services are delivered digitally, ensuring you receive guidance quickly and securely.
        </p>
      </header>

      <section className="space-y-5">
        {policies.map((policy) => (
          <article
            key={policy.title}
            className="rounded-2xl bg-slate-900/60 p-6 shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/20 backdrop-blur"
          >
            <h2 className="text-2xl font-semibold text-purple-200">{policy.title}</h2>
            <p className="mt-3 leading-relaxed text-slate-200">{policy.description}</p>
          </article>
        ))}
      </section>

      <footer className="rounded-2xl bg-purple-900/20 p-6 text-sm leading-relaxed text-purple-100 ring-1 ring-purple-500/20">
        <p>
          For urgent delivery support, email{' '}
          <a
            href="mailto:support@astro-talks.app"
            className="font-medium text-purple-200 underline underline-offset-4"
          >
            support@astro-talks.app
          </a>{' '}
          and we will respond within 1 business day.
        </p>
      </footer>
    </main>
  )
}


