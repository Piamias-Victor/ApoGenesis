// src/app/page.tsx
import React from 'react';
import { AnimatedBackground } from '@/components/atoms/AnimatedBackground/AnimatedBackground';
import { Footer } from '@/components/organisms/Footer/Footer';
import { HeroSection } from '@/components/organisms/HeroSection/HeroSection';
import { DashboardFeaturesSection } from '@/components/organisms/DashboardFeaturesSection/DashboardFeaturesSection';
import { AboutSection } from '@/components/organisms/AboutSection/AboutSection';

/**
 * HomePage - Page d'accueil sans header (géré par HeaderProvider)
 * 
 * Layout principal avec hero section, features dashboard, about section et footer
 * Header géré automatiquement par HeaderProvider selon la route
 */
export default function HomePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background animé avec blobs */}
      <AnimatedBackground />
      
      {/* Contenu principal avec padding pour footer */}
      <main className="relative z-10 pb-20">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center">
          <HeroSection />
        </section>

        {/* Dashboard Features Section */}
        <section id="dashboard" className="min-h-screen flex items-center justify-center bg-white/30">
          <DashboardFeaturesSection />
        </section>

        {/* About Section */}
        <section id="about" className="min-h-screen flex items-center justify-center">
          <AboutSection />
        </section>

      </main>
      
      {/* Footer sticky */}
      <Footer />
    </div>
  );
}