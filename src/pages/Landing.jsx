import { lazy, Suspense, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import Hero from "../components/sections/Hero";
import usePageMeta from "../hooks/usePageMeta";

// Lazy load all sections
const CoreFeatures = lazy(() => import("../components/sections/CoreFeatures"));
const OnlineBooking = lazy(() => import("../components/sections/OnlineBooking"));
const PainSolution = lazy(() => import("../components/sections/PainSolution"));
const Pricing = lazy(() => import("../components/sections/Pricing"));
const Testimonials = lazy(() => import("../components/sections/Testimonials"));
const FAQ = lazy(() => import("../components/sections/FAQ"));
const CTA = lazy(() => import("../components/sections/CTA"));

// Loading skeletons for lazy components
function SectionSkeleton() {
  return (
    <div className="container py-16">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Animated section wrapper for advanced scroll animations
function AnimatedSection({ children, id, className = "" }) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95,
      rotateX: 10
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      {children}
    </motion.section>
  );
}

export default function Landing() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");
    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts < 6) {
        attempts += 1;
        setTimeout(tryScroll, 200);
      }
    };

    // small timeout to allow layout/lazy sections to mount
    setTimeout(tryScroll, 50);
  }, [location]);

  // Set SEO meta for the landing page
  usePageMeta({
    title: "تابيبي — نظام إدارة العيادات والمواعيد",
    description:
      "تابيبي نظام عربي لإدارة العيادات: حجز مواعيد، ملف طبي، فواتير، وتقارير.",
    url: typeof window !== "undefined" ? window.location.href : "/",
    canonical:
      typeof window !== "undefined" ? window.location.href.split("#")[0] : "/",
    image: "/hero-optimized.webp",
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div dir="rtl" className="min-h-svh bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-70">
        <div className="absolute -top-24 start-1/2 -translate-x-1/2 size-[40rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 end-0 size-[24rem] rounded-full bg-secondary/20 blur-3xl" />
      </div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Header />
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Hero />
        </motion.div>
      </motion.div>
      
      {/* Lazy load sections with fallback UI and animations */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Suspense fallback={<SectionSkeleton />}>
            <CoreFeatures />
          </Suspense>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Suspense fallback={<SectionSkeleton />}>
            <OnlineBooking />
          </Suspense>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Suspense fallback={<SectionSkeleton />}>
            <PainSolution />
          </Suspense>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Suspense fallback={<SectionSkeleton />}>
            <Pricing />
          </Suspense>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Suspense fallback={<SectionSkeleton />}>
            <Testimonials />
          </Suspense>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Suspense fallback={<SectionSkeleton />}>
            <FAQ />
          </Suspense>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Suspense fallback={<SectionSkeleton />}>
            <CTA />
          </Suspense>
        </motion.div>
      </motion.div>
      
      <Footer />
    </div>
  );
}