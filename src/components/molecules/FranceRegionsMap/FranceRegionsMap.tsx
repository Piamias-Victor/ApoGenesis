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

// Données des 13 régions françaises avec paths SVG simplifiés
const FRENCH_REGIONS: Region[] = [
  {
    id: 'ile-de-france',
    name: 'Île-de-France',
    path: 'M280,150 L320,140 L330,160 L310,180 L270,170 Z'
  },
  {
    id: 'centre-val-de-loire',
    name: 'Centre-Val de Loire',
    path: 'M230,180 L280,170 L290,200 L250,210 L220,190 Z'
  },
  {
    id: 'bourgogne-franche-comte',
    name: 'Bourgogne-Franche-Comté',
    path: 'M320,160 L370,150 L380,180 L340,190 L320,170 Z'
  },
  {
    id: 'normandie',
    name: 'Normandie',
    path: 'M200,100 L260,90 L270,130 L220,140 L190,120 Z'
  },
  {
    id: 'hauts-de-france',
    name: 'Hauts-de-France',
    path: 'M260,80 L320,70 L330,110 L280,120 L250,100 Z'
  },
  {
    id: 'grand-est',
    name: 'Grand Est',
    path: 'M330,90 L400,80 L410,130 L360,140 L340,110 Z'
  },
  {
    id: 'pays-de-la-loire',
    name: 'Pays de la Loire',
    path: 'M150,180 L220,170 L230,210 L180,220 L140,200 Z'
  },
  {
    id: 'bretagne',
    name: 'Bretagne',
    path: 'M80,150 L150,140 L160,180 L110,190 L70,170 Z'
  },
  {
    id: 'nouvelle-aquitaine',
    name: 'Nouvelle-Aquitaine',
    path: 'M150,220 L230,210 L240,280 L180,290 L130,250 Z'
  },
  {
    id: 'auvergne-rhone-alpes',
    name: 'Auvergne-Rhône-Alpes',
    path: 'M290,210 L350,200 L360,260 L310,270 L280,230 Z'
  },
  {
    id: 'occitanie',
    name: 'Occitanie',
    path: 'M200,280 L290,270 L300,330 L240,340 L180,310 Z'
  },
  {
    id: 'provence-alpes-cote-azur',
    name: 'Provence-Alpes-Côte d\'Azur',
    path: 'M320,280 L380,270 L390,320 L350,330 L310,300 Z'
  },
  {
    id: 'corse',
    name: 'Corse',
    path: 'M420,320 L440,310 L450,350 L430,360 L410,340 Z'
  }
];

/**
 * FranceRegionsMap - Carte interactive des régions françaises
 * 
 * Permet de sélectionner des régions en cliquant dessus
 * Affiche le nombre de pharmacies par région au survol
 */
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
        viewBox="0 0 500 400"
        className="w-full h-auto border border-gray-200 rounded-lg"
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