import React, { useState } from 'react';
import { DollarSign, Plus, TrendingDown, TrendingUp, Wallet, PieChart, Brain, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinance } from '@/hooks/useFinance';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const FinanceSection = () => {
  const { transactions, addTransaction, deleteTransaction, stats } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const chartData = [
    { name: 'Ingresos', value: stats.totalIncome, color: '#10b981' },
    { name: 'Gastos', value: stats.totalExpense, color: '#f43f5e' }
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    addTransaction({
      amount: parseFloat(amount),
      type,
      category,
      description,
      date: new Date().toISOString()
    });
    setAmount('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header & Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className="md:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-zinc-400 font-medium">Saldo Total</span>
          </div>
          <h3 className={cn(
            "text-4xl font-black tracking-tight",
            stats.balance >= 0 ? "text-zinc-100" : "text-red-400"
          )}>
            ${stats.balance.toLocaleString()}
          </h3>
        </motion.div>

        <div className="md:col-span-2 flex gap-4">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Ingresos</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">${stats.totalIncome.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-2 text-rose-400">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Gastos</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">${stats.totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-zinc-500" />
              <h3 className="font-bold text-zinc-100">Comparativa Mensual</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsAIModalOpen(true)} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
              <Brain className="w-4 h-4 mr-2" />
              Análisis IA
            </Button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-zinc-100">Transacciones</h3>
            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {transactions.length === 0 ? (
              <p className="text-center text-zinc-500 py-10 text-sm">No hay movimientos registrados.</p>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      t.type === 'income' ? "bg-emerald-500/10" : "bg-rose-500/10"
                    )}>
                      {t.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{t.category}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={cn(
                      "text-sm font-bold",
                      t.type === 'income' ? "text-emerald-400" : "text-zinc-100"
                    )}>
                      {t.type === 'income' ? '+' : '-'}${t.amount}
                    </p>
                    <button onClick={() => deleteTransaction(t.id)} className="text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Transacción">
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                type === 'expense' ? "bg-rose-500 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                type === 'income' ? "bg-emerald-500 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Ingreso
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Monto</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Categoría</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                placeholder="Ej: Comida, Renta, Salario"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Descripción (Opcional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                placeholder="Detalle del movimiento"
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-4 text-lg font-black">
            Registrar {type === 'income' ? 'Ingreso' : 'Gasto'}
          </Button>
        </form>
      </Modal>

      {/* AI Advice Modal */}
      <Modal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} title="Análisis de Gastos IA">
        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-emerald-400" />
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Oportunidades de Ahorro</p>
            </div>
            <p className="text-zinc-300 leading-relaxed italic">
              &quot;He analizado tus gastos de la semana. ¿Realmente crees que el gasto en <strong>{transactions.find(t => t.type === 'expense')?.category || 'compras'}</strong> es esencial ahora mismo? Podrías ahorrar este 1% y reinvertirlo.&quot;
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Consejos personalizados</h4>
            <ul className="space-y-2">
              <li className="flex gap-2 text-sm text-zinc-400">
                <span className="text-emerald-500">✓</span>
                Reduce suscripciones que no has usado en 30 días.
              </li>
              <li className="flex gap-2 text-sm text-zinc-400">
                <span className="text-emerald-500">✓</span>
                Compara precios antes de tu próxima compra grande.
              </li>
            </ul>
          </div>

          <Button onClick={() => setIsAIModalOpen(false)} variant="outline" className="w-full">
            Entendido, lo tendré en cuenta
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
