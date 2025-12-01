const policies = [
  {
    title: 'Session Credits & Scheduling',
    points: [
      'All consultations require upfront payment. Once a session starts, the allocated time is considered consumed.',
      'If you face technical issues before the session begins, reach out immediately so we can reschedule without extra cost.',
    ],
  },
  {
    title: 'Cancellation Window',
    points: [
      'You can cancel or reschedule a confirmed paid session up to 6 hours before the scheduled start for a full credit refund.',
      'Cancellations requested inside the 6-hour window are treated as completed consultations and are non-refundable.',
    ],
  },
  {
    title: 'Refund Eligibility',
    points: [
      'Refunds are granted only when a paid session does not start due to an issue on our side (for example, astrologer unavailability or platform downtime).',
      'Refund requests must be made within 48 hours of the incident by emailing support@astronova.app with payment details and a brief description.',
    ],
  },
  {
    title: 'Processing Time',
    points: [
      'Approved refunds are processed within 5-7 working days back to the original payment method.',
      'You will receive an email confirmation once the refund has been initiated.',
    ],
  },
  {
    title: 'Non-Refundable Items',
    points: [
      'Promotional/free credits and completed consultations are non-refundable.',
      'Any chargeback filed after a successful consultation may lead to account suspension until the dispute is resolved.',
    ],
  },
]

export const metadata = {
  title: 'Cancellation & Refund Policy | Astronova',
  description:
    'Understand the cancellation windows, refund eligibility, and processing timelines for Astronova sessions.',
}

export default function CancellationRefundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16 text-slate-100">
      <header className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
          Last updated: 8 Nov 2025
        </p>
        <h1 className="text-4xl font-semibold">Cancellation &amp; Refund Policy</h1>
        <p className="text-slate-300">
          These guidelines explain when you can reschedule or request a refund for paid consultations.
        </p>
      </header>

      <section className="space-y-8">
        {policies.map((policy) => (
          <article
            key={policy.title}
            className="rounded-2xl bg-slate-900/60 p-6 shadow-lg shadow-amber-900/20 ring-1 ring-amber-500/20 backdrop-blur"
          >
            <h2 className="text-2xl font-semibold text-amber-200">{policy.title}</h2>
            <ul className="mt-4 space-y-3 leading-relaxed text-slate-200">
              {policy.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <footer className="rounded-2xl bg-amber-900/20 p-6 text-sm leading-relaxed text-amber-100 ring-1 ring-amber-500/20">
        <p>
          Need help? Email{' '}
          <a
            href="mailto:support@astronova.app"
            className="font-medium text-amber-200 underline underline-offset-4"
          >
            support@astronova.app
          </a>{' '}
          with your order ID, and the team will respond within 2 business days.
        </p>
      </footer>
    </main>
  )
}


