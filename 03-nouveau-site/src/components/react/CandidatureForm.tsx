import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

type FormData = {
  nom: string;
  email: string;
  telephone: string;
  poste: string;
  motivation: string;
  rgpd: boolean;
};

const postes = [
  'Chauffeur PL / SPL',
  'Conducteur d\'engins (CACES)',
  'Chef de chantier',
  'Conducteur de travaux',
  'Ouvrier TP',
  'Mécanicien TP',
  'Technicien désamiantage',
  'Administratif / Comptabilité',
  'Autre poste',
];

const inputClass =
  'w-full rounded-btn bg-white/5 border border-white/10 px-3.5 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors duration-150';

const errorClass = 'mt-1.5 text-xs text-red-400 flex items-center gap-1';

function ErrorIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

export default function CandidatureForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onBlur' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCvError('');
    if (!file) { setCvFile(null); return; }
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setCvError('Format accepté : PDF, DOC ou DOCX');
      setCvFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('Le fichier ne doit pas dépasser 5 Mo');
      setCvFile(null);
      return;
    }
    setCvFile(file);
  };

  const onSubmit = async (data: FormData) => {
    if (!cvFile) { setCvError('Veuillez joindre votre CV'); return; }
    setStatus('loading');

    try {
      const formData = new FormData();
      formData.append('form-name', 'candidature');
      formData.append('nom', data.nom);
      formData.append('email', data.email);
      formData.append('telephone', data.telephone);
      formData.append('poste', data.poste);
      formData.append('motivation', data.motivation);
      formData.append('cv', cvFile);

      const res = await fetch('/', { method: 'POST', body: formData });

      if (res.ok) {
        setStatus('success');
        reset();
        setCvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
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
            <h3 className="font-heading font-bold text-xl text-white mb-2">Candidature reçue !</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Merci pour votre intérêt. Nous étudierons votre dossier et reviendrons vers vous dans les meilleurs délais.
            </p>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="text-sm text-primary hover:text-primary-light font-medium transition-colors"
          >
            Envoyer une autre candidature
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          name="candidature"
          method="POST"
          data-netlify="true"
          encType="multipart/form-data"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="form-name" value="candidature" />

          {/* Nom */}
          <div>
            <label htmlFor="c-nom" className="block text-xs font-medium text-gray-400 mb-1.5">
              Nom complet <span className="text-primary">*</span>
            </label>
            <input
              id="c-nom"
              type="text"
              placeholder="Jean Dupont"
              className={inputClass}
              aria-invalid={!!errors.nom}
              {...register('nom', { required: 'Le nom est requis' })}
            />
            {errors.nom && <p className={errorClass}><ErrorIcon />{errors.nom.message}</p>}
          </div>

          {/* Email + Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="c-email" className="block text-xs font-medium text-gray-400 mb-1.5">
                Email <span className="text-primary">*</span>
              </label>
              <input
                id="c-email"
                type="email"
                placeholder="jean@email.fr"
                className={inputClass}
                aria-invalid={!!errors.email}
                {...register('email', {
                  required: 'L\'email est requis',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
                })}
              />
              {errors.email && <p className={errorClass}><ErrorIcon />{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="c-telephone" className="block text-xs font-medium text-gray-400 mb-1.5">
                Téléphone <span className="text-primary">*</span>
              </label>
              <input
                id="c-telephone"
                type="tel"
                placeholder="06 00 00 00 00"
                className={inputClass}
                aria-invalid={!!errors.telephone}
                {...register('telephone', {
                  required: 'Le téléphone est requis',
                  pattern: { value: /^[0-9\s\+\-\.]{7,20}$/, message: 'Numéro invalide' },
                })}
              />
              {errors.telephone && <p className={errorClass}><ErrorIcon />{errors.telephone.message}</p>}
            </div>
          </div>

          {/* Poste */}
          <div>
            <label htmlFor="c-poste" className="block text-xs font-medium text-gray-400 mb-1.5">
              Poste visé <span className="text-primary">*</span>
            </label>
            <select
              id="c-poste"
              className={`${inputClass} appearance-none cursor-pointer`}
              aria-invalid={!!errors.poste}
              {...register('poste', { required: 'Veuillez sélectionner un poste' })}
            >
              <option value="" disabled>Sélectionnez un poste…</option>
              {postes.map(p => (
                <option key={p} value={p} className="bg-gray-900 text-white">{p}</option>
              ))}
            </select>
            {errors.poste && <p className={errorClass}><ErrorIcon />{errors.poste.message}</p>}
          </div>

          {/* CV upload */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              CV <span className="text-primary">*</span>
              <span className="text-gray-600 ml-1 font-normal">(PDF, DOC ou DOCX — max 5 Mo)</span>
            </label>
            <label
              htmlFor="c-cv"
              className={`
                flex items-center gap-3 w-full rounded-btn border border-dashed px-4 py-4 cursor-pointer transition-colors duration-150
                ${cvFile
                  ? 'border-green-500/40 bg-green-500/5 hover:bg-green-500/10'
                  : cvError
                    ? 'border-red-400/40 bg-red-400/5 hover:bg-red-400/10'
                    : 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5'}
              `}
            >
              {cvFile ? (
                <>
                  <svg className="w-5 h-5 text-green-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm text-green-400 truncate">{cvFile.name}</span>
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="ml-auto text-gray-500 hover:text-white transition-colors shrink-0"
                    aria-label="Supprimer le fichier"
                  >
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-gray-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span className="text-sm text-gray-500">Glisser votre CV ici ou <span className="text-primary underline underline-offset-2">parcourir</span></span>
                </>
              )}
            </label>
            <input
              id="c-cv"
              ref={fileInputRef}
              type="file"
              name="cv"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="sr-only"
            />
            {cvError && <p className={errorClass}><ErrorIcon />{cvError}</p>}
          </div>

          {/* Lettre de motivation */}
          <div>
            <label htmlFor="c-motivation" className="block text-xs font-medium text-gray-400 mb-1.5">
              Lettre de motivation <span className="text-primary">*</span>
            </label>
            <textarea
              id="c-motivation"
              rows={5}
              placeholder="Présentez-vous et expliquez pourquoi vous souhaitez rejoindre notre équipe…"
              className={`${inputClass} resize-none`}
              aria-invalid={!!errors.motivation}
              {...register('motivation', {
                required: 'La lettre de motivation est requise',
                minLength: { value: 50, message: 'Merci d\'écrire au moins 50 caractères' },
              })}
            />
            {errors.motivation && <p className={errorClass}><ErrorIcon />{errors.motivation.message}</p>}
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
                J'accepte que mes données et mon CV soient conservés par Puechoultres & Fils pour l'étude de ma candidature (durée maximale : 2 ans).{' '}
                <span className="text-primary">*</span>
              </span>
            </label>
            {errors.rgpd && <p className={`${errorClass} mt-2`}><ErrorIcon />{errors.rgpd.message}</p>}
          </div>

          {/* Erreur serveur */}
          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-btn px-4 py-3"
            >
              <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Une erreur est survenue. Réessayez ou envoyez votre CV par email.
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
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Envoyer ma candidature
              </>
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
