import { AnimatedBackground } from '@/components/atoms/AnimatedBackground/AnimatedBackground';

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background animé avec blobs */}
      <AnimatedBackground />
      
      {/* Contenu vide - arrière-plan prêt */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {/* Page blanche cassée - prête pour contenu */}
      </div>
    </main>
  );
}