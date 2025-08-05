// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AnimatedBackground } from '@/components/atoms/AnimatedBackground/AnimatedBackground';
import { Header } from '@/components/organisms/Header/Header';
import { Input } from '@/components/atoms/Input/Input';
import { Button } from '@/components/atoms/Button/Button';
import { Card } from '@/components/atoms/Card/Card';
import { Notification } from '@/components/atoms/Notification/Notification';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * Login Page - Page de connexion ApoData
 * 
 * Formulaire centré avec validation temps réel,
 * show/hide password, remember me et gestion d'erreurs
 */
export default function LoginPage(): JSX.Element {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleInputChange = (field: keyof LoginForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? event.target.checked : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing (only for email/password)
    if (field !== 'rememberMe' && errors[field as keyof LoginErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email invalide';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual login logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate login error for demo
      if (formData.email === 'error@test.com') {
        throw new Error('Email ou mot de passe incorrect');
      }
      
      console.log('Login successful:', formData);
      // TODO: Redirect to dashboard
      setNotificationMessage('Connexion réussie ! Redirection...');
      setShowNotification(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setNotificationMessage(errorMessage);
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // TODO: Implement forgot password logic
    setNotificationMessage('Fonctionnalité bientôt disponible');
    setShowNotification(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background animé */}
      <AnimatedBackground />
      
      {/* Header */}
      <Header />
      
      {/* Notification */}
      <Notification
        type="error"
        message={notificationMessage}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
        autoClose
        duration={4000}
      />
      
      {/* Contenu principal */}
      <main className="relative z-10 pt-16 pb-20">
        <div className="min-h-[calc(100vh-9rem)] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            
            {/* Retour à l'accueil */}
            <div className="mt-12 mb-6">
              <Link 
                href="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </div>

            <Card variant="elevated" padding="xl">
              <div className="space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Se connecter
                  </h1>
                  <p className="text-gray-600">
                    Accédez à votre dashboard ApoData pour reprendre la main sur vos données
                  </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Email */}
                  <Input
                    variant="default"
                    size="lg"
                    label="Email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    error={errors.email}
                    iconLeft={<Mail />}
                    required
                  />

                  {/* Password */}
                  <Input
                    variant="default"
                    size="lg"
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    error={errors.password}
                    iconLeft={<Lock />}
                    iconRight={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="cursor-pointer hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    }
                    required
                  />

                  {/* Remember Me */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange('rememberMe')}
                      className="
                        w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded
                        focus:ring-blue-500 focus:ring-2 transition-colors duration-200
                      "
                    />
                    <label 
                      htmlFor="rememberMe" 
                      className="ml-2 text-sm text-gray-700 cursor-pointer"
                    >
                      Se souvenir de moi
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    fullWidth
                    loading={isSubmitting}
                    loadingText="Connexion..."
                    iconRight={<LogIn />}
                  >
                    Se connecter
                  </Button>

                  {/* Forgot Password */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="md"
                      type="button"
                      onClick={handleForgotPassword}
                    >
                      Mot de passe oublié ?
                    </Button>
                  </div>

                </form>

                {/* Footer info */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Connexion sécurisée • Données chiffrées • Conformité RGPD
                  </p>
                </div>

              </div>
            </Card>

            

          </motion.div>
        </div>
      </main>
    </div>
  );
}