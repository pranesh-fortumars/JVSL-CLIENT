import { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { supabase, type Enquiry } from '@/lib/supabase';

const SUBJECTS = [
  'General enquiry',
  'Fresh Daily order support',
  'Partnership / business',
  'Feedback',
  'Other',
];

type Errors = Partial<Record<keyof Enquiry, string>>;

export function ContactPage() {
  const [form, setForm] = useState<Enquiry>({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const update = (field: keyof Enquiry, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!form.phone.trim()) {
      e.phone = 'Please enter your mobile number.';
    } else if (!/^[+\d][\d\s-]{7,15}$/.test(form.phone.trim())) {
      e.phone = 'Please enter a valid phone number.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address.';
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      e.message = 'Please tell us a little more (at least 10 characters).';
    }
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setStatus('idle');
    try {
      const { error } = await supabase.from('enquiries').insert({
        name: form.name.trim(),
        email: form.email?.trim() || null,
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      if (error) throw error;
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-[calc(var(--header-h)+2rem)]">
      <section className="relative overflow-hidden pb-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Contact &amp; enquiries</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ink-950 sm:text-5xl">
              Let's talk fresh.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-600">
              Questions about Fresh Daily, a delivery issue, or a partnership idea? Send us
              a message and we'll get back to you.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact details */}
          <Reveal>
            <div className="card h-full p-7">
              <h2 className="font-display text-xl font-bold text-ink-900">Reach us directly</h2>
              <ul className="mt-6 space-y-5">
                {[
                  { icon: MapPin, label: 'Address', value: 'Shakhwala, JVLSD — India' },
                  { icon: Phone, label: 'Phone', value: '+91 00000 00000', href: 'tel:+910000000000' },
                  { icon: Mail, label: 'Email', value: 'hello@jvlsd.in', href: 'mailto:hello@jvlsd.in' },
                  { icon: Clock, label: 'Service hours', value: 'Pre-order: 24/7 · Same-day delivery: 7 AM – 9 PM' },
                ].map((c) => (
                  <li key={c.label} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className="mt-0.5 block font-semibold text-ink-900 hover:text-brand-700">
                          {c.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 font-semibold text-ink-900">{c.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-7 rounded-2xl bg-brand-50/70 p-5 text-sm text-ink-700">
                <p className="font-semibold text-brand-800">Same-day delivery area</p>
                <p className="mt-1">Within 3 km of our Shakhwala dispatch point, subject to operational feasibility.</p>
              </div>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={120}>
            <form onSubmit={onSubmit} className="card p-7 sm:p-8" noValidate>
              <h2 className="font-display text-xl font-bold text-ink-900">Send an enquiry</h2>

              {status === 'success' && (
                <div
                  role="status"
                  className="mt-5 flex items-start gap-3 rounded-2xl bg-brand-50 p-4 text-brand-800"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <p className="text-sm">
                    Thank you — your enquiry has been submitted. We'll get back to you shortly.
                  </p>
                </div>
              )}
              {status === 'error' && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm">
                    Something went wrong while submitting. Please try again in a moment.
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label">
                    Full name <span className="text-red-600" aria-hidden>*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input-field"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    autoComplete="name"
                  />
                  {errors.name && <p className="field-error" role="alert">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="label">
                    Mobile number <span className="text-red-600" aria-hidden>*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    aria-required="true"
                    aria-invalid={!!errors.phone}
                    autoComplete="tel"
                    placeholder="e.g. +91 90000 00000"
                  />
                  {errors.phone && <p className="field-error" role="alert">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    Email <span className="text-ink-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    aria-invalid={!!errors.email}
                    autoComplete="email"
                  />
                  {errors.email && <p className="field-error" role="alert">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="subject" className="label">Subject</label>
                  <select
                    id="subject"
                    className="input-field"
                    value={form.subject}
                    onChange={(e) => update('subject', e.target.value)}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="message" className="label">
                    Message <span className="text-red-600" aria-hidden>*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="input-field resize-y"
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    aria-required="true"
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && <p className="field-error" role="alert">{errors.message}</p>}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-xs text-ink-500">
                  By submitting, you agree to be contacted about your enquiry.
                </p>
                <button type="submit" className="btn-primary px-6 py-3" disabled={submitting}>
                  {submitting ? (
                    <>Sending…</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send enquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
