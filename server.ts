import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '30mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // 1. Multi-turn Chat Endpoint with Model Selection, Search Grounding, and Maps Grounding
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        messages = [],
        systemInstruction,
        model = 'gemini-3.5-flash',
        toolType = 'none', // 'none' | 'googleSearch' | 'googleMaps'
        location,
      } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'Messages array is required.' });
        return;
      }

      // Convert messages to Gemini contents format
      const contents = messages.map((m: { role: string; text: string }) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.text }],
      }));

      // Base configuration
      const config: any = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      // Determine model and tools based on request
      let selectedModel = model;
      if (toolType === 'googleSearch') {
        selectedModel = 'gemini-3.5-flash';
        config.tools = [{ googleSearch: {} }];
      } else if (toolType === 'googleMaps') {
        selectedModel = 'gemini-3.5-flash';
        config.tools = [{ googleMaps: {} }];
        if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: location.latitude,
                longitude: location.longitude,
              },
            },
          };
        }
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config,
      });

      const responseText = response.text || '';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        text: responseText,
        groundingChunks,
        modelUsed: selectedModel,
      });
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate response from Gemini API',
      });
    }
  });

  // 2. Audio Transcription Endpoint using gemini-3.5-transcribe
  app.post('/api/gemini/transcribe', async (req, res) => {
    try {
      const { audioData, mimeType = 'audio/webm', prompt } = req.body;

      if (!audioData) {
        res.status(400).json({ error: 'audioData base64 string is required.' });
        return;
      }

      const audioPart = {
        inlineData: {
          mimeType,
          data: audioData,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text:
                prompt ||
                'Transcribe the spoken audio with medical accuracy, punctuation, and clear terminology.',
            },
          ],
        },
      });

      res.json({
        transcript: response.text || '',
      });
    } catch (error: any) {
      console.error('Gemini transcribe error:', error);
      res.status(500).json({
        error: error.message || 'Failed to transcribe audio with Gemini',
      });
    }
  });

  // 3. AI Health Insights & Clinical Biometric Analysis using gemini-3.8-flash
  app.post('/api/gemini/health-insights', async (req, res) => {
    try {
      const { user, vitals = [], dailyGoals } = req.body;

      const latestVital = vitals[0] || {};
      const avgHr =
        vitals.length > 0
          ? Math.round(vitals.reduce((acc: number, v: any) => acc + (v.heartRate || 70), 0) / vitals.length)
          : latestVital.heartRate || 72;
      const avgSpo2 =
        vitals.length > 0
          ? parseFloat(
              (
                vitals.reduce((acc: number, v: any) => acc + (v.oxygenSaturation || 98), 0) / vitals.length
              ).toFixed(1)
            )
          : latestVital.oxygenSaturation || 98;
      const avgSleep =
        vitals.length > 0
          ? parseFloat(
              (vitals.reduce((acc: number, v: any) => acc + (v.sleepHours || 7.5), 0) / vitals.length).toFixed(1)
            )
          : latestVital.sleepHours || 7.5;

      const prompt = `You are a certified clinical health & biometric wellness AI advisor adhering to established medical guidelines (American Heart Association AHA, American College of Cardiology ACC, National Sleep Foundation NSF, and World Health Organization WHO).

Patient Profile:
- Name: ${user?.name || 'Patient'}
- Age: ${user?.age || 38} years
- Gender: ${user?.gender || 'Unspecified'}
- Blood Type: ${user?.bloodType || 'Unknown'}
- Primary Medical Focus: ${user?.primaryCondition || 'General Wellness & Preventive Monitoring'}

Current & Longitudinal Telemetry:
- Latest Heart Rate: ${latestVital.heartRate || 72} bpm (7-Day Average: ${avgHr} bpm)
- Latest SpO2 Oxygen Saturation: ${latestVital.oxygenSaturation || 98}% (7-Day Average: ${avgSpo2}%)
- Latest Sleep Duration: ${latestVital.sleepHours || 7.5} hrs (7-Day Average: ${avgSleep} hrs)
- Latest Blood Pressure: ${
        latestVital.bloodPressureSystolic && latestVital.bloodPressureDiastolic
          ? `${latestVital.bloodPressureSystolic}/${latestVital.bloodPressureDiastolic} mmHg`
          : '118/78 mmHg'
      }
- Daily Goals: Sleep Goal ${dailyGoals?.sleepHoursGoal || 8.0}h, Heart Rate Ceiling ≤${
        dailyGoals?.heartRateTarget || 70
      } bpm
- Recent Notes: ${latestVital.notes || 'Normal routine'}

Analyze these parameters and provide structured clinical insights with personalized recommendations referenced to medical guidelines.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an evidence-based clinical intelligence advisor. Provide accurate, professional, empathetic, and guideline-referenced health tips based on cardiovascular, pulmonary, and circadian physiology. All output must be valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallAssessment: {
                type: Type.STRING,
                description: '2-3 sentence clinical synthesis of patient cardiovascular stability and circadian recovery.',
              },
              riskLevel: {
                type: Type.STRING,
                description: 'Risk assessment status: "Optimal", "Low Risk", "Moderate", or "Attention Needed"',
              },
              keyObservations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 concise bullet points identifying trends in heart rate, oxygenation, sleep, or BP.',
              },
              personalizedTips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description: 'Cardiovascular, Circadian Sleep, Respiratory, or Recovery',
                    },
                    guidelineRef: {
                      type: Type.STRING,
                      description: 'e.g., "AHA 2023 Guidelines", "National Sleep Foundation", "WHO"',
                    },
                    action: { type: Type.STRING, description: 'Practical behavioral or lifestyle step' },
                    benefit: { type: Type.STRING, description: 'Clinical physiological benefit' },
                  },
                  required: ['title', 'category', 'guidelineRef', 'action', 'benefit'],
                },
                description: '3-4 personalized, practical health tips.',
              },
              lifestyleAdvice: {
                type: Type.STRING,
                description: 'Holistic lifestyle guidance regarding hydration, stress mitigation, and sleep hygiene.',
              },
              safetyFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Precautions or thresholds that should prompt professional in-person medical evaluation.',
              },
            },
            required: [
              'overallAssessment',
              'riskLevel',
              'keyObservations',
              'personalizedTips',
              'lifestyleAdvice',
              'safetyFlags',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      console.error('Gemini health insights error:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate AI health insights',
      });
    }
  });

  // Vite Integration: middleware mode in dev, static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealthCare AI Hub fullstack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
