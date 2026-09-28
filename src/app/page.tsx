"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContractSchema, ContractFormData } from '@/lib/schema';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

export default function ContractForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContractFormData>({
    resolver: zodResolver(ContractSchema),
  });

  const onSubmit = async (data: ContractFormData) => {
    setStatus('loading');
    try {
      const response = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Fehler beim Senden des Vertrags');

      setStatus('success');
      setMessage('Vertrag wurde erfolgreich generiert und versendet!');
      reset();
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Vertrags-Generator</h1>
          <p className="text-gray-500 mt-2">Bitte geben Sie die Kundendaten für den Investmentvertrag ein.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vorname</label>
              <input {...register('firstName')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nachname</label>
              <input {...register('lastName')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email-Adresse</label>
            <input {...register('email')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Anlage Summe</label>
              <input {...register('amount')} placeholder="z.B. 10.000 €" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rendite (p.a.)</label>
              <input {...register('returnRate')} placeholder="z.B. 5" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.returnRate && <p className="text-red-500 text-xs mt-1">{errors.returnRate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Laufzeit</label>
              <input {...register('term')} placeholder="z.B. 24 Monate" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-//md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.term && <p className="text-red-500 text-xs mt-1">{errors.term.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Laufzeitende</label>
              <input {...register('endDate')} placeholder="z.B. 25.09.2026" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Willkommensbonus</label>
            <input {...register('bonus')} placeholder="z.B. 500 €" className="mt-//md block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            {errors.bonus && <p className="text-red-500 text-xs mt-1">{errors.bonus.message}</p>}
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all"
          >
            {status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            Vertrag generieren & versenden
          </button>

          {status === 'success' && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {message}
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
