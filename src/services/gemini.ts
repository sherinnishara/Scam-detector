/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisInput, DashboardData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeCompany(input: AnalysisInput): Promise<DashboardData> {
  const prompt = `
    You are a company verification assistant helping students check if a job offer or recruitment call is legitimate.
    
    Research the company "${input.companyName}" located in ${input.city}, ${input.state} and return ONLY a valid JSON object with no markdown, no extra text.
    
    {
      "companyName": "Official company name",
      "industry": "e.g. IT Services / Product / Startup",
      "headquarters": "City, Country",
      "founded": "Year or N/A",
      "companyType": "MNC / Startup / SME / Unknown",
      "employees": "e.g. 3,17,000+",
      "stockListed": "Yes (NSE/NYSE) / No / Unknown",
      "ceo": "Name or N/A",
      "website": "URL or N/A",
      "linkedinFollowers": "e.g. 7M+ or Unknown",
      "glassdoorRating": "e.g. 3.9/5 or Not Listed",
    
      "fraudRiskScore": <integer 0 to 100>,
      "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN",
      "legitimacyVerdict": "LEGIT" | "SUSPICIOUS" | "SCAM" | "UNVERIFIED",
      "verdictNote": "One short sentence only",
    
      "fresherFriendly": true | false,
      "campusRecruiter": true | false,
      "knownForHiring": true | false,
      "averagePackage": "e.g. 3.6 – 8 LPA or Unknown",
      "hiringProcess": "Short steps only e.g. Online Test → HR Round → Offer via iConnect",
    
      "sentimentScore": <float -1.0 to 1.0>,
      "sentimentLabel": "Positive" | "Neutral" | "Negative" | "Mixed",
      "sentimentSummary": "One sentence summary of public sentiment",

      "interviewTips": ["Tip 1", "Tip 2", "Tip 3"],
      "salaryBenchmarking": [
        { "role": "Software Engineer", "avgSalary": "4.5 LPA", "industryAvg": "4.2 LPA" }
      ],
      "recentNews": [
        { "title": "News Title", "date": "Date", "source": "Source" }
      ],
      "trustBreakdown": [
        { "category": "Website Age", "score": 85, "note": "Registered 10 years ago" },
        { "category": "Social Presence", "score": 40, "note": "Low LinkedIn activity" }
      ],

      "redFlags": [
        { "text": "Short red flag description", "level": "HIGH" | "MEDIUM" | "LOW" }
      ],
    
      "positiveSignals": [
        "Short signal 1",
        "Short signal 2"
      ],
    
      "reviews": [
        {
          "name": "Reviewer name",
          "role": "Job role (can be in Tamil if reviewer is Tamil-speaking)",
          "lang": "en" | "ta",
          "type": "pos" | "neg",
          "stars": <integer 1 to 5>,
          "date": "Mon YYYY",
          "text": "Review text — write in Tamil if lang is 'ta', English if 'en'. Keep it realistic and short.",
          "tags": ["Tag1", "Tag2"]
        }
      ],
    
      "verifyAt": ["e.g. LinkedIn", "Glassdoor", "MCA India", "iConnect Portal"]
    }
    
    Rules:
    - Generate at least 4 reviews — mix of English and Tamil (தமிழ்), positive and negative
    - Tamil reviews must be written fully in Tamil script
    - No paragraph values anywhere — use short phrases only
    - If company is unknown or fake, reflect that in fraudRiskScore and riskLevel
    - redFlags must be specific to this company, not generic
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          companyName: { type: Type.STRING },
          industry: { type: Type.STRING },
          headquarters: { type: Type.STRING },
          founded: { type: Type.STRING },
          companyType: { type: Type.STRING },
          employees: { type: Type.STRING },
          stockListed: { type: Type.STRING },
          ceo: { type: Type.STRING },
          website: { type: Type.STRING },
          linkedinFollowers: { type: Type.STRING },
          glassdoorRating: { type: Type.STRING },
          fraudRiskScore: { type: Type.INTEGER },
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "UNKNOWN"] },
          legitimacyVerdict: { type: Type.STRING, enum: ["LEGIT", "SUSPICIOUS", "SCAM", "UNVERIFIED"] },
          verdictNote: { type: Type.STRING },
          fresherFriendly: { type: Type.BOOLEAN },
          campusRecruiter: { type: Type.BOOLEAN },
          knownForHiring: { type: Type.BOOLEAN },
          averagePackage: { type: Type.STRING },
          hiringProcess: { type: Type.STRING },
          sentimentScore: { type: Type.NUMBER },
          sentimentLabel: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative", "Mixed"] },
          sentimentSummary: { type: Type.STRING },
          interviewTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          salaryBenchmarking: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                avgSalary: { type: Type.STRING },
                industryAvg: { type: Type.STRING }
              },
              required: ["role", "avgSalary", "industryAvg"]
            }
          },
          recentNews: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                date: { type: Type.STRING },
                source: { type: Type.STRING }
              },
              required: ["title", "date", "source"]
            }
          },
          trustBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                score: { type: Type.INTEGER },
                note: { type: Type.STRING }
              },
              required: ["category", "score", "note"]
            }
          },
          redFlags: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                level: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] }
              },
              required: ["text", "level"]
            }
          },
          positiveSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
          reviews: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                lang: { type: Type.STRING, enum: ["en", "ta"] },
                type: { type: Type.STRING, enum: ["pos", "neg"] },
                stars: { type: Type.INTEGER },
                date: { type: Type.STRING },
                text: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "role", "lang", "type", "stars", "date", "text", "tags"]
            }
          },
          verifyAt: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: [
          "companyName", "industry", "headquarters", "founded", "companyType", "employees",
          "stockListed", "ceo", "website", "linkedinFollowers", "glassdoorRating",
          "fraudRiskScore", "riskLevel", "legitimacyVerdict", "verdictNote",
          "fresherFriendly", "campusRecruiter", "knownForHiring", "averagePackage",
          "hiringProcess", "sentimentScore", "sentimentLabel", "sentimentSummary",
          "interviewTips", "salaryBenchmarking", "recentNews", "trustBreakdown",
          "redFlags", "positiveSignals", "reviews", "verifyAt"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text) as DashboardData;
}
