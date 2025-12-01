const sections = [
  {
    title: 'Information We Collect',
    items: [
      'Profile details you provide such as name, date of birth, birth time, and gender so astrologers can prepare readings.',
      'Conversation data from your sessions to help us deliver, improve, and review the guidance experience.',
      'Technical data like device type, browser, and IP address that helps us keep the platform secure and diagnose issues.',
    ],
  },
  {
    title: 'How We Use Your Information',
    items: [
      'Deliver personalised astrological insights and maintain your chat history.',
      'Provide customer support, detect misuse, and improve product features.',
      'Communicate important updates, service alerts, and policy changes.',
    ],
  },
  {
    title: 'Data Sharing & Retention',
    items: [
      'We never sell your personal data. Limited partners (for example, payment gateways) receive only the data required to complete their service.',
      'Access to personal information is restricted to authorised team members bound by confidentiality obligations.',
      'We retain chat transcripts and account data for as long as needed to provide the service or as required by applicable law.',
    ],
  },
  {
    title: 'Your Choices',
    items: [
      'Request a copy of your data or ask us to delete it by writing to support@astronova.app.',
      'Update your profile details from within the product or by contacting support.',
      'Opt out of non-essential emails using the unsubscribe link in every message.',
    ],
  },
  {
    title: 'Security Measures',
    items: [
      'We employ encryption in transit, access controls, and regular security reviews.',
      'In the unlikely event of a breach, affected users will be informed together with remedial steps.',
    ],
  },
]

export const metadata = {
  title: 'Privacy Policy | Astronova',
  description:
    'Understand how Astronova collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16 text-slate-100">
      <header className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
          Last updated: 8 Nov 2025
        </p>
        <h1 className="text-4xl font-semibold">Privacy Policy</h1>
        <p className="text-slate-300">
          We value your trust. This Privacy Policy explains what data we collect,
          why we collect it, how it is used, and the choices you have.
        </p>
      </header>

      <section className="space-y-10">
        {sections.map((section) => (
          <article key={section.title} className="rounded-2xl bg-slate-900/60 p-6 shadow-lg shadow-amber-900/20 ring-1 ring-amber-500/20 backdrop-blur">
            <h2 className="text-2xl font-semibold text-amber-200">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-3 text-slate-200">
              {section.items.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <footer className="rounded-2xl bg-amber-900/20 p-6 text-sm leading-relaxed text-amber-100 ring-1 ring-amber-500/20">
        <p>
          For questions or requests related to this Privacy Policy, contact us at{' '}
          <a
            href="mailto:support@astronova.app"
            className="font-medium text-amber-200 underline underline-offset-4"
          >
            support@astronova.app
          </a>
          . We aim to respond within 3 working days.
        </p>
      </footer>
    </main>
  )
}


