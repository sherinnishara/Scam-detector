/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
export type LegitimacyVerdict = 'LEGIT' | 'SUSPICIOUS' | 'SCAM' | 'UNVERIFIED';

export interface RedFlag {
  text: string;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Review {
  name: string;
  role: string;
  lang: 'en' | 'ta';
  type: 'pos' | 'neg';
  stars: number;
  date: string;
  text: string;
  tags: string[];
}

export interface DashboardData {
  companyName: string;
  industry: string;
  headquarters: string;
  founded: string;
  companyType: string;
  employees: string;
  stockListed: string;
  ceo: string;
  website: string;
  linkedinFollowers: string;
  glassdoorRating: string;

  fraudRiskScore: number;
  riskLevel: RiskLevel;
  legitimacyVerdict: LegitimacyVerdict;
  verdictNote: string;

  fresherFriendly: boolean;
  campusRecruiter: boolean;
  knownForHiring: boolean;
  averagePackage: string;
  hiringProcess: string;

  sentimentScore: number; // -1 to 1
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  sentimentSummary: string;

  interviewTips: string[];
  salaryBenchmarking: { role: string; avgSalary: string; industryAvg: string }[];
  recentNews: { title: string; date: string; source: string }[];
  trustBreakdown: { category: string; score: number; note: string }[];

  redFlags: RedFlag[];
  positiveSignals: string[];
  reviews: Review[];
  verifyAt: string[];
}

export interface AnalysisInput {
  companyName: string;
  state: string;
  city: string;
}
