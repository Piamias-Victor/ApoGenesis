// src/components/organisms/ObjectivesProgressSection.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/atoms/Card/Card';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';

interface ObjectiveData {
  id: string;
  label: string;
  current: number;
  objective: number;
  previousValue: number; // Pour calculer % évolution
  color: string;
  bgColor: string;
}

interface ObjectivesProgressSectionProps {
  className?: string;
}

export default function ObjectivesProgressSection({ className = '' }: ObjectivesProgressSectionProps) {
  const [objectives, setObjectives] = useState<ObjectiveData[]>([
    {
      id: 'sell_in',
      label: 'CA Sell-In',
      current: 189420,
      objective: 220000,
      previousValue: 175000,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'sell_out',
      label: 'CA Sell-Out',
      current: 245850,
      objective: 280000,
      previousValue: 230000,
      color: 'bg-green-500',
      bgColor: 'bg-green-100'
    },
    {
      id: 'marge',
      label: 'Marge',
      current: 56430,
      objective: 70000,
      previousValue: 52000,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100'
    }
  ]);

  const [editingObjective, setEditingObjective] = useState<string | null>(null);
  const [objectiveType, setObjectiveType] = useState<'amount' | 'percentage'>('amount');
  const [tempValue, setTempValue] = useState<string>('');

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);

  const calculateProgress = (current: number, objective: number) => 
    Math.min(Math.round((current / objective) * 100), 100);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'warning';
    return 'gray';
  };

  const handleObjectiveEdit = (id: string, currentObjective: number) => {
    setEditingObjective(id);
    setObjectiveType('amount');
    setTempValue(currentObjective.toString());
  };

  const calculateObjectiveFromPercentage = (previousValue: number, percentage: number) => {
    return Math.round(previousValue * (1 + percentage / 100));
  };

  const handleObjectiveSave = (id: string) => {
    const currentObj = objectives.find(obj => obj.id === id);
    if (!currentObj) return;

    let newObjective: number;
    
    if (objectiveType === 'percentage') {
      const percentage = parseFloat(tempValue);
      if (isNaN(percentage)) return;
      newObjective = calculateObjectiveFromPercentage(currentObj.previousValue, percentage);
    } else {
      newObjective = parseInt(tempValue);
      if (isNaN(newObjective) || newObjective <= 0) return;
    }

    setObjectives(prev => 
      prev.map(obj => 
        obj.id === id ? { ...obj, objective: newObjective } : obj
      )
    );
    
    setEditingObjective(null);
    setTempValue('');
    setObjectiveType('amount');
  };

  const handleObjectiveCancel = () => {
    setEditingObjective(null);
    setTempValue('');
    setObjectiveType('amount');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
      className={`mt-8 ${className}`}
    >
      <Card variant="elevated" padding="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Objectifs Mensuels
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Suivi de performance vs objectifs fixés
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="primary" size="sm">
                Août 2025
              </Badge>
              <Badge variant="gray" size="sm">
                3/3 définis
              </Badge>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-6">
            {objectives.map((objective) => {
              const progress = calculateProgress(objective.current, objective.objective);
              
              return (
                <div key={objective.id} className="space-y-3">
                  {/* Label et valeurs */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${objective.color} rounded-full flex-shrink-0`} />
                      <span className="font-medium text-gray-900">{objective.label}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(objective.current)} / {formatCurrency(objective.objective)}
                        </div>
                        <div className={`text-xs ${getProgressColor(progress)}`}>
                          {progress}% réalisé
                        </div>
                      </div>
                      
                      <Badge variant={getProgressBadgeVariant(progress)} size="sm">
                        {progress >= 90 ? '🎯' : progress >= 75 ? '⚡' : '⚠️'}
                      </Badge>
                      
                      <Button
                                  onClick={() => handleObjectiveEdit(objective.id, objective.objective)}
                                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors" variant={'primary'} size={'sm'}>
                        Modifier
                      </Button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative">
                    <div className={`w-full h-2 ${objective.bgColor} rounded-full overflow-hidden`}>
                      <motion.div
                        className={`h-full ${objective.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                      />
                    </div>
                    
                    {/* Seuils visuels */}
                    <div className="absolute top-0 left-[75%] w-px h-2 bg-orange-300 opacity-60" title="Seuil 75%" />
                    <div className="absolute top-0 left-[90%] w-px h-2 bg-green-300 opacity-60" title="Seuil 90%" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal d'édition d'objectif */}
          {editingObjective && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Modifier l'objectif
                </h4>
                
                <div className="space-y-4">
                  {/* Sélecteur de type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'objectif
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setObjectiveType('amount')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          objectiveType === 'amount'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Montant fixe
                      </button>
                      <button
                        onClick={() => setObjectiveType('percentage')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          objectiveType === 'percentage'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        % évolution
                      </button>
                    </div>
                  </div>

                  {/* Input selon le type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {objectiveType === 'amount' ? 'Objectif (€)' : 'Évolution souhaitée (%)'}
                    </label>
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={objectiveType === 'amount' ? 'Ex: 250000' : 'Ex: 15'}
                      step={objectiveType === 'percentage' ? '0.1' : '1'}
                      autoFocus
                    />
                    {objectiveType === 'percentage' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Basé sur la valeur du mois précédent
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleObjectiveCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleObjectiveSave(editingObjective)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}