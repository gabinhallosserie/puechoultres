import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

type FormData = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
  rgpd: boolean;
};

const sujets = [
  'Travaux publics',
  'Voirie et réseaux',
  'Assainissement',
  'Goudronnage et enrobés',
  'Béton prêt à l\'emploi',
  'Transport',
  'Démolition',
  'Désamiantage',
  'Levage',
  'Location d\'engins',
  'Recyclage',
  'Aménagement extérieur',
  'Autre demande',
];

const inputClass =
  'w-full rounded-btn bg-white/5 border border-white/10 px-3.5 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors duration-150';

const errorClass = 'mt-1.5 text-xs text-red-400 flex items-center gap-1';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onBlur' });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const body = new URLSearchParams({
        'form-name': 'contact',
        ...Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
      });
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        setStatus('success');
        reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center py-12 gap-5"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">Message envoyé !</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Nous avons bien reçu votre demande. Nous vous répondrons sous 48h.
              </p>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="text-sm text-primary hover:text-primary-light font-medium transition-colors"
            >
              Envoyer un autre message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            name="contact"
            method="POST"
            data-netlify="true"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Champ caché pour Netlify */}
            <input type="hidden" name="form-name" value="contact" />

            {/* Nom + Prénom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className="block text-xs font-medium text-gray-400 mb-1.5">
                  Nom <span className="text-primary">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Dupont"
                  className={inputClass}
                  aria-invalid={!!errors.nom}
                  {...register('nom', { required: 'Le nom est requis' })}
                />
                {errors.nom && (
                  <p className={errorClass}>
                    <svg className="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors.nom.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="prenom" className="block text-xs font-medium text-gray-400 mb-1.5">
                  Prénom <span className="text-primary">*</span>
                </label>
                <input
                  id="prenom"
                  type="text"
                  placeholder="Jean"
                  className={inputClass}
                  aria-invalid={!!errors.prenom}
                  {...register('prenom', { required: 'Le prénom est requis' })}
                />
                {errors.prenom && (
                  <p className={errorClass}>
                    <svg className="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors.prenom.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5">
                Email <span className="text-primary">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="jean.dupont@email.fr"
                className={inputClass}
                aria-invalid={!!errors.email}
                {...register('email', {
                  required: 'L\'adresse email est requise',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Adresse email invalide',
                  },
                })}
              />
              {errors.email && (
                <p className={errorClass}>
                  <svg className="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-xs font-medium text-gray-400 mb-1.5">
                Téléphone
              </label>
              <input
                id="telephone"
                type="tel"
                placeholder="06 00 00 00 00"
                className={inputClass}
                {...register('telephone', {
                  pattern: {
                    value: /^[0-9\s\+\-\.]{7,20}$/,
                    message: 'Numéro de téléphone invalide',
                  },
                })}
              />
              {errors.telephone && (
                <p className={errorClass}>
                  <svg className="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.telephone.message}
                </p>
              )}
            </div>

            {/* Sujet */}
            <div>
              <label htmlFor="sujet" className="block text-xs font-medium text-gray-400 mb-1.5">
                Sujet <span className="text-primary">*</span>
              </label>
              <select
                id="sujet"
                className={`${inputClass} appearance-none cursor-pointer`}
                aria-invalid={!!errors.sujet}
                {...register('sujet', { required: 'Veuillez sélectionner un sujet' })}
              >
                <option value="" disabled>Sélectionnez un service…</option>
                {sujets.map(s => (
                  <option key={s} value={s} className="bg-gray-900 text-white">{s}</option>
                ))}
              </select>
              {errors.sujet && (
                <p className={errorClass}>
                  <svg className="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.sujet.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-xs font-medium text-gray-400 mb-1.5">
                Message <span className="text-primary">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Décrivez votre projet, la localisation, les contraintes…"
                className={`${inputClass} resize-none`}
                aria-invalid={!!errors.message}
                {...register('message', {
                  required: 'Le message est requis',
                  minLength: { value: 20, message: 'Le message doit faire au moins 20 caractères' },
                })}
              />
              {errors.message && (
                <p className={errorClass}>
                  <svg className="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* RGPD */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer shrink-0"
                  aria-invalid={!!errors.rgpd}
                  {...register('rgpd', { required: 'Vous devez accepter la politique de confidentialité' })}
                />
                <span className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  J'accepte que mes données soient traitées par Puechoultres & Fils pour répondre à ma demande. Elles ne seront pas transmises à des tiers.{' '}
                  <span className="text-primary">*</span>
                </span>
              </label>
              {errors.rgpd && (
                <p className={`${errorClass} mt-2`}>
                  <svg className="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.rgpd.message}
                </p>
              )}
            </div>

            {/* Erreur serveur */}
            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-btn px-4 py-3"
              >
                <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Une erreur est survenue. Réessayez ou appelez le 05 65 69 02 70.
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="relative w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-btn bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {status === 'loading' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi en cours…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Envoyer ma demande
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-600">Réponse sous 48h · Devis gratuit</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
