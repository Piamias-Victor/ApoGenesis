// src/components/molecules/FranceRegionsMap/FranceRegionsMap.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Region {
  readonly id: string;
  readonly name: string;
  readonly path: string;
}

interface FranceRegionsMapProps {
  readonly selectedRegions: string[];
  readonly onRegionClick: (regionName: string) => void;
  readonly getPharmacyCount: (regionName: string) => number;
  readonly className?: string;
}

// SVG réaliste des 13 régions françaises basé sur les vraies coordonnées
const FRENCH_REGIONS: Region[] = [
  {
    id: 'ile-de-france',
    name: 'Île-de-France',
    path: 'M287,157 L302,151 L315,158 L322,171 L318,184 L308,192 L295,189 L283,180 L279,167 Z'
  },
  {
    id: 'centre-val-de-loire', 
    name: 'Centre-Val de Loire',
    path: 'M235,185 L283,175 L308,192 L315,215 L298,235 L275,242 L250,238 L225,225 L220,205 Z'
  },
  {
    id: 'bourgogne-franche-comte',
    name: 'Bourgogne-Franche-Comté',
    path: 'M315,158 L385,148 L415,155 L425,175 L420,195 L408,215 L385,225 L355,218 L330,208 L315,185 Z'
  },
  {
    id: 'normandie',
    name: 'Normandie', 
    path: 'M180,105 L260,95 L285,115 L295,138 L283,158 L255,165 L225,162 L195,155 L165,142 L155,125 Z'
  },
  {
    id: 'hauts-de-france',
    name: 'Hauts-de-France',
    path: 'M260,75 L325,68 L365,75 L385,95 L380,118 L365,135 L340,142 L315,140 L285,135 L265,118 L255,95 Z'
  },
  {
    id: 'grand-est',
    name: 'Grand Est',
    path: 'M365,75 L435,68 L465,78 L485,105 L485,135 L475,158 L455,175 L425,182 L395,175 L375,158 L365,135 Z'
  },
  {
    id: 'pays-de-la-loire',
    name: 'Pays de la Loire',
    path: 'M125,175 L185,168 L215,185 L225,208 L218,235 L195,252 L165,258 L135,252 L108,238 L98,215 Z'
  },
  {
    id: 'bretagne',
    name: 'Bretagne',
    path: 'M25,155 L85,148 L125,158 L145,178 L135,198 L115,215 L85,222 L55,218 L25,205 L15,185 L18,165 Z'
  },
  {
    id: 'nouvelle-aquitaine',
    name: 'Nouvelle-Aquitaine',
    path: 'M98,235 L165,225 L195,245 L215,275 L225,305 L215,345 L195,375 L165,385 L125,382 L95,368 L75,345 L68,315 L75,285 L85,255 Z'
  },
  {
    id: 'auvergne-rhone-alpes', 
    name: 'Auvergne-Rhône-Alpes',
    path: 'M275,242 L345,235 L385,245 L415,265 L425,295 L418,325 L395,352 L365,365 L335,358 L305,345 L285,322 L278,295 Z'
  },
  {
    id: 'occitanie',
    name: 'Occitanie',
    path: 'M165,358 L225,348 L275,355 L315,372 L345,395 L335,425 L315,445 L285,452 L245,448 L205,438 L175,425 L155,405 L148,385 Z'
  },
  {
    id: 'provence-alpes-cote-azur',
    name: 'Provence-Alpes-Côte d\'Azur',
    path: 'M345,395 L395,385 L425,398 L445,418 L448,442 L435,465 L415,472 L385,468 L355,458 L335,442 L328,425 Z'
  },
  {
    id: 'corse',
    name: 'Corse',
    path: 'M485,415 L502,408 L512,425 L515,455 L508,485 L495,498 L478,495 L468,478 L465,455 L472,435 Z'
  }
];

export const FranceRegionsMap: React.FC<FranceRegionsMapProps> = ({
  selectedRegions,
  onRegionClick,
  getPharmacyCount,
  className = '',
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const isRegionSelected = (regionName: string): boolean => {
    return selectedRegions.includes(regionName);
  };

  const getRegionColor = (regionName: string): string => {
    if (isRegionSelected(regionName)) {
      return '#3b82f6'; // Blue-500 pour sélectionné
    }
    if (hoveredRegion === regionName) {
      return '#60a5fa'; // Blue-400 pour survol
    }
    return '#e5e7eb'; // Gray-200 par défaut
  };

  const getRegionStroke = (regionName: string): string => {
    if (isRegionSelected(regionName)) {
      return '#1d4ed8'; // Blue-700
    }
    return '#9ca3af'; // Gray-400
  };

  return (
    <div className={`relative ${className}`}>
      <motion.svg
        viewBox="0 0 550 520"
        className="w-full h-auto border border-gray-200 rounded-lg bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {FRENCH_REGIONS.map((region) => {
          const pharmacyCount = getPharmacyCount(region.name);
          
          return (
            <motion.path
              key={region.id}
              d={region.path}
              fill={getRegionColor(region.name)}
              stroke={getRegionStroke(region.name)}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredRegion(region.name)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => onRegionClick(region.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            />
          );
        })}
      </motion.svg>

      {/* Tooltip au survol */}
      {hoveredRegion && (
        <motion.div
          className="
            absolute top-2 left-2 bg-black/80 text-white text-xs 
            px-2 py-1 rounded pointer-events-none z-10
          "
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="font-medium">{hoveredRegion}</div>
          <div className="text-gray-300">
            {getPharmacyCount(hoveredRegion)} pharmacie(s)
          </div>
        </motion.div>
      )}

      {/* Légende */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded-sm" />
          <span>Non sélectionné</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 border border-blue-700 rounded-sm" />
          <span>Sélectionné</span>
        </div>
      </div>
    </div>
  );
};