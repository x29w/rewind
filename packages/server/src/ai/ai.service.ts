/**
 * AI 分析服务
 * AI Analysis Service
 * AI 分析サービス
 * AI 分析服務
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface AnalysisResult {
  rootCause: string;
  possibleReasons: string[];
  fixSuggestions: string[];
  relatedIssues: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;
  private enabled = false;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.enabled = true;
      this.logger.log('OpenAI integration enabled');
    } else {
      this.logger.warn('OpenAI API key not found, AI analysis disabled');
    }
  }

  async analyzeError(
    errorMessage: string,
    stack: string,
    breadcrumbs: any[],
    deviceInfo: any,
  ): Promise<AnalysisResult | null> {
    if (!this.enabled || !this.openai) {
      return null;
    }

    try {
      const context = this.buildContext(errorMessage, stack, breadcrumbs, deviceInfo);
      const prompt = this.buildPrompt(context);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert frontend developer and debugging assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return null;
      }

      return this.parseResponse(response);
    } catch (error) {
      this.logger.error(`AI analysis failed: ${error.message}`, error.stack);
      return null;
    }
  }

  private buildContext(
    errorMessage: string,
    stack: string,
    breadcrumbs: any[],
    deviceInfo: any,
  ): string {
    const recentBreadcrumbs = breadcrumbs.slice(-5);
    
    return `
Error: ${errorMessage}
Stack: ${stack}
Actions: ${recentBreadcrumbs.map((b, i) => `${i + 1}. ${b.message}`).join('\n')}
Device: ${deviceInfo.userAgent}
    `.trim();
  }

  private buildPrompt(context: string): string {
    return `Analyze this error and return JSON: ${context}`;
  }

  private parseResponse(response: string): AnalysisResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          rootCause: parsed.rootCause || 'Unable to determine',
          possibleReasons: parsed.possibleReasons || [],
          fixSuggestions: parsed.fixSuggestions || [],
          relatedIssues: parsed.relatedIssues || [],
          severity: parsed.severity || 'medium',
        };
      }

      return {
        rootCause: response.substring(0, 200),
        possibleReasons: [],
        fixSuggestions: [],
        relatedIssues: [],
        severity: 'medium',
      };
    } catch (error) {
      this.logger.error('Failed to parse AI response', error);
      return {
        rootCause: 'Analysis failed',
        possibleReasons: [],
        fixSuggestions: [],
        relatedIssues: [],
        severity: 'medium',
      };
    }
  }

  async findSimilarIssues(
    errorMessage: string,
    stack: string,
  ): Promise<string[]> {
    if (!this.enabled || !this.openai) {
      return [];
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Similar errors to: "${errorMessage}". Return JSON array.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return [];
      }

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      this.logger.error('Failed to find similar issues', error);
      return [];
    }
  }
}
