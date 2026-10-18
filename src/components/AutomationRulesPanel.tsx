/**
 * Copyright (c) 2026 Rostro Compliance Systems (مشروع روسترو للامتثال).
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 * @file src/components/AutomationRulesPanel.tsx
 * @module @rostro/ui/AutomationRulesPanel
 * @description
 * Deterministic Policy & Straight-Through Processing (STP) Threshold Configuration Panel.
 * Allows compliance administrators to configure minimum OCR confidence, maximum risk score,
 * biometric face-match thresholds, and governorate review rules without bypassing hard math invariants.
 */

import React from 'react';
import { Cpu, CheckCircle2, Sliders } from 'lucide-react';
import type { AutomationConfig, KYCApplicant, Language } from '../utils/kycEngine';
import { evaluateApplicantWithRules } from '../utils/kycEngine';
import { t } from '../utils/i18n';

interface AutomationRulesPanelProps {
  config: AutomationConfig;
  applicants: KYCApplicant[];
  lang: Language;
  onChangeConfig: (next: AutomationConfig) => void;
  onRunBatch: () => void;
}

export const AutomationRulesPanel: React.FC<AutomationRulesPanelProps> = ({
  config,
  applicants,
  lang,
  onChangeConfig,
  onRunBatch,
}) => {
  const pendingOrFlagged = applicants.filter(
    (a) => a.status === 'pending' || a.status === 'flagged'
  );

  const simulatedOutcomes = pendingOrFlagged.map((app) => ({
    applicant: app,
    evalResult: evaluateApplicantWithRules(app, config),
  }));

  const wouldApproveCount = simulatedOutcomes.filter(
    (x) => x.evalResult.nextStatus === 'approved'
  ).length;
  const wouldFlagCount = simulatedOutcomes.filter(
    (x) => x.evalResult.nextStatus === 'flagged'
  ).length;
  const wouldRejectCount = simulatedOutcomes.filter(
    (x) => x.evalResult.nextStatus === 'rejected'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Primary Batch Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t(lang, 'workflowSectionTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t(lang, 'workflowSectionSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={onRunBatch}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Cpu className="w-4 h-4" />
          <span>
            {t(lang, 'runBatchBtn')} ({pendingOrFlagged.length})
          </span>
        </button>
      </div>

      {/* Two-Column Split: Threshold Controls & Live Simulation Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Rule Threshold Sliders & Toggles */}
        <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 rounded-lg p-5 bg-white dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>01. Straight-Through Processing (STP) Thresholds</span>
          </div>

          <div className="space-y-4">
            {/* Risk Score Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label
                  htmlFor="slider-max-risk"
                  className="font-medium text-slate-700 dark:text-slate-300"
                >
                  {t(lang, 'ruleMaxRiskLabel')}
                </label>
                <span className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  &le; {config.autoApproveMaxRiskScore} / 100
                </span>
              </div>
              <input
                id="slider-max-risk"
                type="range"
                min={5}
                max={60}
                value={config.autoApproveMaxRiskScore}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    autoApproveMaxRiskScore: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Min OCR Confidence Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label
                  htmlFor="slider-min-ocr"
                  className="font-medium text-slate-700 dark:text-slate-300"
                >
                  {t(lang, 'ruleMinOcrLabel')}
                </label>
                <span className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  &ge; {config.minOcrConfidence}%
                </span>
              </div>
              <input
                id="slider-min-ocr"
                type="range"
                min={75}
                max={99}
                value={config.minOcrConfidence}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    minOcrConfidence: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Min Biometric Match Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label
                  htmlFor="slider-min-bio"
                  className="font-medium text-slate-700 dark:text-slate-300"
                >
                  {t(lang, 'ruleMinBioLabel')}
                </label>
                <span className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  &ge; {config.minBiometricScore}%
                </span>
              </div>
              <input
                id="slider-min-bio"
                type="range"
                min={75}
                max={99}
                value={config.minBiometricScore}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    minBiometricScore: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Boolean Policy Toggles */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <label className="flex items-center justify-between gap-3 text-xs cursor-pointer">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {t(lang, 'ruleSanctionsToggle')}
              </span>
              <input
                type="checkbox"
                checked={config.autoRejectSanctionsHit}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    autoRejectSanctionsHit: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between gap-3 text-xs cursor-pointer">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {t(lang, 'ruleExpiryToggle')}
              </span>
              <input
                type="checkbox"
                checked={config.strictExpiryCheck}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    strictExpiryCheck: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between gap-3 text-xs cursor-pointer">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {t(lang, 'ruleHighRiskUtilityToggle')}
              </span>
              <input
                type="checkbox"
                checked={config.requireUtilityBillForHighRisk}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    requireUtilityBillForHighRisk: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Live Impact Preview on Queue */}
        <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 rounded-lg p-5 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                02. Dry-Run Queue Simulation ({pendingOrFlagged.length} Active)
              </span>
              <span className="text-xs font-mono text-slate-500">DETERMINISTIC PREVIEW</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {wouldApproveCount}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Auto-Approve
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {wouldFlagCount}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Escalate / Flag
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400">
                  {wouldRejectCount}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Auto-Reject
                </div>
              </div>
            </div>

            {/* Per-applicant preview list */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 max-h-60 overflow-y-auto">
              {simulatedOutcomes.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  All pending dossiers have already been adjudicated.
                </div>
              ) : (
                simulatedOutcomes.map(({ applicant, evalResult }) => (
                  <div key={applicant.id} className="py-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {lang === 'ar' ? applicant.fullNameAr : applicant.fullNameEn}
                      </span>
                      <span
                        className={`font-mono font-semibold uppercase ${
                          evalResult.nextStatus === 'approved'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : evalResult.nextStatus === 'rejected'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        → {evalResult.nextStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang === 'ar' ? evalResult.reasonAr : evalResult.reasonEn}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              FATF Recommendation 10 Compliant
            </span>
            <span className="font-mono">STP v3.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
