// src/app/test-stock/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function DashboardComplet() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pharmacyId, setPharmacyId] = useState<string>('');
  const [startDate, setStartDate] = useState('2025-07-01');
  const [endDate, setEndDate] = useState('2025-08-05');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(pharmacyId && { pharmacyId })
      });
      
      const response = await fetch(`/api/dashboard/kpis?${params}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement');
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
  };

  const formatPercent = (value: number) => {
    const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
    const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '→';
    return <span className={color}>{arrow} {Math.abs(value).toFixed(1)}%</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Erreur</h3>
            <p>{error}</p>
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) return null;

  const kpis = data.data;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Pharmacie - Complet</h1>
          <p className="text-gray-600 mt-2">Analyse complète Sell-Out, Sell-In et Stock</p>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacie (UUID)</label>
              <input
                type="text"
                value={pharmacyId}
                onChange={(e) => setPharmacyId(e.target.value)}
                placeholder="Vide = toutes les pharmacies"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchData}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* KPIs principaux - 3 colonnes */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* SELL-OUT */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">📊 SELL-OUT (Ventes)</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">CA TTC</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis.ca_sellout)}</p>
                <p className="text-sm">{formatPercent(kpis.ca_sellout_evolution)} vs N-1</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">Marge brute</p>
                <p className="text-xl font-semibold">{formatCurrency(kpis.marge_brute)}</p>
                <p className="text-sm text-gray-500">Taux: {kpis.taux_marge.toFixed(1)}%</p>
              </div>
              <div className="border-t pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-600">Transactions</p>
                  <p className="font-semibold">{formatNumber(kpis.nb_transactions)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ticket moy.</p>
                  <p className="font-semibold">{formatCurrency(kpis.ticket_moyen)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Quantités</p>
                  <p className="font-semibold">{formatNumber(kpis.quantite_vendue)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Labs actifs</p>
                  <p className="font-semibold">{kpis.nb_labs_vendus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SELL-IN */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-green-600">📦 SELL-IN (Achats)</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">CA Achats</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis.ca_sellin)}</p>
                <p className="text-sm">{formatPercent(kpis.ca_sellin_evolution)} vs N-1</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">Commandes</p>
                <p className="text-xl font-semibold">{formatNumber(kpis.nb_commandes)}</p>
                <p className="text-sm text-gray-500">{kpis.nb_fournisseurs} fournisseurs</p>
              </div>
              <div className="border-t pt-3 text-xs">
                <p className="text-gray-600">Quantités reçues</p>
                <p className="font-semibold">{formatNumber(kpis.quantite_recue)} unités</p>
                <p className="text-gray-600 mt-1">{kpis.nb_laboratoires} laboratoires</p>
              </div>
            </div>
          </div>

          {/* STOCK */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-purple-600">📦 STOCK</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Valeur stock</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis.stock_valorise)}</p>
                <p className="text-sm text-gray-500">{formatNumber(kpis.nb_references)} réf.</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">Rotation</p>
                <p className="text-xl font-semibold">{kpis.rotation_stock}x/an</p>
                <p className="text-sm text-gray-500">
                  {kpis.rotation_stock > 12 ? '✅ Excellente' : 
                   kpis.rotation_stock > 8 ? '⚠️ Correcte' : '❌ Faible'}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">Couverture</p>
                <p className="text-xl font-semibold">{kpis.couverture_jours} jours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analyse comparative Sell-In vs Sell-Out */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">📈 Analyse Sell-In vs Sell-Out</h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-2">Ratio Sell-Out / Sell-In</p>
              <div className="text-2xl font-bold">
                {kpis.ca_sellin > 0 ? ((kpis.ca_sellout / kpis.ca_sellin) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {kpis.ca_sellout > kpis.ca_sellin ? '✅ Déstockage' : '⚠️ Sur-stockage'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Différence</p>
              <div className="text-2xl font-bold">
                {formatCurrency(kpis.ca_sellout - kpis.ca_sellin)}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Marge sur achats</p>
              <div className="text-2xl font-bold">
                {kpis.ca_sellin > 0 ? ((kpis.marge_brute / kpis.ca_sellin) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Tops côte à côte */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Top 5 Labs Sell-Out */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Top 5 Laboratoires - Ventes</h3>
            <div className="space-y-2">
              {kpis.top_labs_sellout?.map((lab: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="font-medium">{lab.lab_name || 'Non spécifié'}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({lab.taux_marge}% marge)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(lab.ca_lab)}</div>
                    <div className="text-xs text-gray-500">{formatNumber(lab.qte_vendue)} unités</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Labs Sell-In */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-green-600">Top 5 Laboratoires - Achats</h3>
            <div className="space-y-2">
              {kpis.top_labs_sellin?.map((lab: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="font-medium">{lab.lab_name || 'Non spécifié'}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({lab.nb_commandes} cmd)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(lab.ca_lab)}</div>
                    <div className="text-xs text-gray-500">{formatNumber(lab.qte_recue)} unités</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Catégories */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">🏷️ Top 5 Catégories</h3>
          <div className="space-y-2">
            {kpis.top_categories?.map((cat: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                    ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-gray-300'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <span className="font-medium">{cat.categorie || 'Non catégorisé'}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      (Marge: {cat.taux_marge}%)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(cat.ca_categorie)}</div>
                  <div className="text-xs text-gray-500">{formatNumber(cat.qte_vendue)} unités</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graphiques de répartition */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Répartition TVA */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">📊 Répartition par TVA</h3>
            <div className="space-y-3">
              {Object.entries({
                '0%': kpis.repartition_tva?.tva_0 || 0,
                '2.1%': kpis.repartition_tva?.tva_2_1 || 0,
                '5.5%': kpis.repartition_tva?.tva_5_5 || 0,
                '10%': kpis.repartition_tva?.tva_10 || 0,
                '20%': kpis.repartition_tva?.tva_20 || 0
              }).map(([taux, pct]) => (
                <div key={taux} className="flex items-center">
                  <span className="w-12 text-sm">{taux}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 mx-2">
                    <div 
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${pct}%` }}
                    >
                      {pct > 5 && <span className="text-xs text-white">{pct}%</span>}
                    </div>
                  </div>
                  {pct <= 5 && <span className="text-xs">{pct}%</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Répartition Remboursement */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">💊 Répartition Remboursement</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded">
                <div>
                  <p className="font-medium">Remboursable</p>
                  <p className="text-2xl font-bold text-green-600">
                    {kpis.repartition_remboursement?.pct_remboursable || 0}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">CA</p>
                  <p className="font-semibold">
                    {formatCurrency(kpis.repartition_remboursement?.ca_remboursable || 0)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Non remboursable</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {100 - (kpis.repartition_remboursement?.pct_remboursable || 0)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">CA</p>
                  <p className="font-semibold">
                    {formatCurrency(kpis.repartition_remboursement?.ca_non_remboursable || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Période et metadata */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">📅 Période analysée :</span> 
            {' '}du {kpis.periode.debut} au {kpis.periode.fin} ({kpis.periode.nb_mois} mois)
          </p>
          {kpis.derniere_maj && (
            <p className="text-xs text-blue-600 mt-1">
              Dernière mise à jour des données : {new Date(kpis.derniere_maj).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        {/* JSON pour debug */}
        <details className="bg-white p-4 rounded-lg shadow">
          <summary className="cursor-pointer font-semibold">🔧 Données brutes (JSON)</summary>
          <pre className="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}