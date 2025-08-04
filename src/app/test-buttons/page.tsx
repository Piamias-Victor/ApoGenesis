// src/app/test-cards/page.tsx
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/atoms/Card/Card';
import { Button } from '@/components/atoms/Button/Button';

// Icons pour enrichir les exemples
const ChartIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const UserIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const SettingsIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const variants = ['default', 'elevated', 'outlined', 'interactive', 'gradient', 'glass'] as const;
const paddings = ['none', 'sm', 'md', 'lg', 'xl'] as const;

export default function TestCardsPage(): JSX.Element {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleLoading = (key: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-apodata">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Card Component Showcase
          </h1>
          <p className="text-xl text-gray-600">
            Design Apple minimaliste avec effets modernes
          </p>
        </div>

        {/* Section Variants */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Variants - Padding MD
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variants.map((variant) => (
              <div key={variant} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 capitalize">
                  {variant}
                </h3>
                
                {/* Card Simple */}
                <Card
                  variant={variant}
                  padding="md"
                  data-testid={`card-${variant}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ChartIcon />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Card {variant}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Exemple de contenu
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Cette carte utilise le variant {variant} avec du contenu démonstratif.
                    </p>
                  </div>
                </Card>

                {/* Card Interactive */}
                <Card
                  variant={variant}
                  padding="md"
                  hoverable
                  onClick={() => console.log(`${variant} card clicked`)}
                >
                  <div className="text-center space-y-2">
                    <div className="text-sm text-gray-500">Cliquable</div>
                    <div className="text-lg font-medium text-gray-900">
                      Hover Effect
                    </div>
                  </div>
                </Card>

                {/* Card Loading */}
                <Card
                  variant={variant}
                  padding="md"
                  loading={loadingStates[variant]}
                  onClick={() => toggleLoading(variant)}
                  hoverable
                >
                  <div className="text-center space-y-2">
                    <div className="text-sm text-gray-500">Cliquer</div>
                    <div className="text-lg font-medium text-gray-900">
                      {loadingStates[variant] ? 'Chargement...' : 'Loading Test'}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Section Paddings */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Paddings - Variant Elevated
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {paddings.map((padding) => (
              <Card
                key={padding}
                variant="elevated"
                padding={padding}
                hoverable
              >
                <div className="text-center">
                  <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                    {padding}
                  </div>
                  <div className="text-lg font-medium text-gray-900">
                    Padding {padding.toUpperCase()}
                  </div>
                  {padding !== 'none' && (
                    <p className="text-sm text-gray-600 mt-2">
                      Contenu avec espacement {padding}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section KPI Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            KPI Cards - Style Pharmaceutique
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="gradient" padding="lg" hoverable>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    CA Sell-Out
                  </h3>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ChartIcon />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">
                    245 850 €
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-medium">+12.5%</span>
                    <span className="text-gray-500 ml-1">vs mois dernier</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="interactive" padding="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Stock Valorisé
                  </h3>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <SettingsIcon />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">
                    89 420 €
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-orange-600 font-medium">-2.1%</span>
                    <span className="text-gray-500 ml-1">rotation optimale</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="glass" padding="lg" hoverable>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Patients Actifs
                  </h3>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserIcon />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">
                    1 247
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-medium">+8.3%</span>
                    <span className="text-gray-500 ml-1">ce trimestre</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Section Cards avec Actions */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Cards avec Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="elevated" padding="lg">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <ChartIcon />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Rapport Mensuel
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Générez votre rapport d'activité mensuel avec tous les KPIs essentiels.
                    </p>
                    <div className="flex space-x-3">
                      <Button variant="primary" size="sm">
                        Générer
                      </Button>
                      <Button variant="secondary" size="sm">
                        Aperçu
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="outlined" padding="lg">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <SettingsIcon />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Configuration
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Personnalisez vos préférences et paramètres d'affichage.
                    </p>
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm" fullWidth>
                        Configurer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Section Performance Test */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Test Performance - 24 Cards
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 24 }, (_, i) => (
              <Card
                key={i}
                variant={variants[i % variants.length]}
                padding="sm"
                hoverable
                onClick={() => console.log(`Performance card ${i}`)}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {i + 1}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {variants[i % variants.length]}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section États Spéciaux */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            États Spéciaux
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="elevated" padding="lg" disabled>
              <div className="text-center space-y-2">
                <div className="text-lg font-medium text-gray-900">
                  Card Désactivée
                </div>
                <p className="text-gray-600">
                  Cette carte est en état disabled
                </p>
              </div>
            </Card>

            <Card 
              variant="interactive" 
              padding="lg" 
              loading={loadingStates['special']}
              onClick={() => toggleLoading('special')}
            >
              <div className="text-center space-y-2">
                <div className="text-lg font-medium text-gray-900">
                  {loadingStates['special'] ? 'Chargement...' : 'Card Loading'}
                </div>
                <p className="text-gray-600">
                  Cliquer pour voir l'état loading
                </p>
              </div>
            </Card>

            <Card variant="glass" padding="none">
              <div className="p-6 text-center space-y-2">
                <div className="text-lg font-medium text-gray-900">
                  Padding None
                </div>
                <p className="text-gray-600">
                  Contrôle manuel du padding
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer Info */}
        <div className="text-center text-gray-500 text-sm space-y-1">
          <p>Toutes les cards utilisent Framer Motion avec animations 60fps</p>
          <p>Hover: scale(1.01) + y(-2px) • Interactive: y(-4px) + scale(1.02)</p>
          <p>6 variants • 5 paddings • États loading/disabled • Glass effect</p>
        </div>
      </div>
    </div>
  );
}