import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// ---- Types ----

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  cta1: { text: string; href: string };
  cta2?: { text: string; href: string };
}

interface Props {
  slides: Slide[];
}

// ---- Animation variants ----

const contentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  exit:   { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.6, ease: [0, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -12,            transition: { duration: 0.25 } },
};

// ---- Component ----

export default function HeroSlider({ slides }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <section className="relative h-svh min-h-[560px]" aria-label="Présentation Puech Oultres">

      {/* ===== Swiper ===== */}
      <Swiper
        className="h-full w-full"
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        speed={800}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, el: '.hero-pagination' }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper) => {
          // Bind custom nav buttons before Swiper initialises
          const nav = swiper.params.navigation;
          if (nav && typeof nav !== 'boolean') {
            nav.prevEl = prevRef.current;
            nav.nextEl = nextRef.current;
          }
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            {/* Background image */}
            <div className="relative h-full w-full overflow-hidden">
              <img
                src={slide.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)' }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ===== Content overlay (outside Swiper for clean stagger) ===== */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto max-w-2xl"
            >
              {/* Title */}
              <motion.h1
                variants={itemVariants}
                className="font-heading font-black text-white leading-[1.1] text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem]"
              >
                {slides[activeIndex].title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={itemVariants}
                className="mt-4 text-gray-200 text-base sm:text-lg leading-relaxed max-w-lg"
              >
                {slides[activeIndex].subtitle}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-4">
                {/* CTA primaire */}
                <a
                  href={slides[activeIndex].cta1.href}
                  className="inline-flex items-center justify-center font-semibold rounded-btn px-8 py-4 text-base text-white will-change-transform transition-all duration-[250ms] ease-[cubic-bezier(0,0,0.2,1)] shadow-btn hover:-translate-y-0.5 hover:shadow-btn-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }}
                >
                  {slides[activeIndex].cta1.text}
                </a>

                {/* CTA secondaire (optionnel) */}
                {slides[activeIndex].cta2 && (
                  <a
                    href={slides[activeIndex].cta2!.href}
                    className="inline-flex items-center justify-center font-semibold rounded-btn px-8 py-4 text-base text-white border-2 border-white bg-transparent will-change-transform transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {slides[activeIndex].cta2!.text}
                  </a>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Navigation flèches ===== */}
      <button
        ref={prevRef}
        aria-label="Slide précédente"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full glass text-white hover:text-primary hover:border-primary/50 transition-colors duration-[250ms] focus-visible:outline-2 focus-visible:outline-primary"
      >
        <ChevronLeft size={22} strokeWidth={2} />
      </button>
      <button
        ref={nextRef}
        aria-label="Slide suivante"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full glass text-white hover:text-primary hover:border-primary/50 transition-colors duration-[250ms] focus-visible:outline-2 focus-visible:outline-primary"
      >
        <ChevronRight size={22} strokeWidth={2} />
      </button>

      {/* ===== Pagination dots ===== */}
      <div className="hero-pagination absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex gap-2" />

      {/* ===== Swiper dot overrides ===== */}
      <style>{`
        .hero-pagination .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255,255,255,0.4);
          border-radius: 9999px;
          transition: all 250ms ease;
          cursor: pointer;
          display: block;
        }
        .hero-pagination .swiper-pagination-bullet-active {
          background: #DC2626;
          width: 28px;
        }
      `}</style>
    </section>
  );
}
