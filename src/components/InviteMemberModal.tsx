import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { UserRole } from '../types/accounting';
import {
  UserPlus,
  Mail,
  Shield,
  User,
  X,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { inviteUser, invitations, removeInvitation } = useAccounting();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('ACCOUNTANT');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setToastMsg(null);

    if (!email || !name) return;

    const res = inviteUser({ email, name, role });
    if (res.success) {
      setToastMsg(`Invitation granted to ${name} (${email})! They can now log in.`);
      setEmail('');
      setName('');
      setTimeout(() => setToastMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to send invite');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Team Access & Invitations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Only invited email accounts can log in to USH TRADERS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast / Error */}
        {toastMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-lg text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Authorize New Email Account
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Partner / Colleague"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Role & Permissions
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ADMIN">Partner / Administrator (Full Access)</option>
              <option value="ACCOUNTANT">Accountant (Sales, Purchases, Ledgers, Reports)</option>
              <option value="SALES_AGENT">Sales Agent (Installment Recovery & Invoicing only)</option>
              <option value="AUDITOR">Auditor (Read-Only Financial View)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Grant Access & Send Invite</span>
          </button>
        </form>

        {/* Active Authorized Users & Invitations */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Authorized Users & Invites ({invitations.length})
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
            {invitations.map(inv => (
              <div key={inv.id} className="p-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{inv.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {inv.email} · {inv.role}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold rounded">
                    Authorized
                  </span>
                  <button
                    onClick={() => removeInvitation(inv.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Revoke access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
