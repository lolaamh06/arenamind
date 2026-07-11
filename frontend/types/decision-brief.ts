import { Severity, Audience } from './index';

export interface EvidenceItem {
  label: string;
  category: string; // e.g., 'transport', 'weather', 'gates'
}

export interface AlternativeOption {
  label: string;
  reason: string;
}

export interface ConfidenceData {
  percentage: number;
  label: string; // e.g., 'High Confidence', 'Moderate Confidence', 'Low Confidence'
}

export interface AIDecisionBrief {
  id: string;
  title: string;
  severity: Severity;
  situationSummary: string;
  recommendation: string;
  evidence: EvidenceItem[];
  confidence: ConfidenceData;
  explanation: string;
  alternativesConsidered: AlternativeOption[];
  timestamp: string;
  audience: Audience;
}
