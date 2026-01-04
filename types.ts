import React from 'react';

export interface Message {
  role: 'user' | 'model';
  text: string;
  isCode?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'white';
}

export enum ViewState {
  HOME = 'HOME',
  FEATURES = 'FEATURES',
  EXAMPLES = 'EXAMPLES',
  SAFETY = 'SAFETY',
  CHAT = 'CHAT'
}

export interface AppSettings {
  enableThinking: boolean;
  thinkingBudget: number;
  creativity: number; // 0.0 to 1.0 (Temperature)
  customSystemPrompt: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  enableThinking: true,
  thinkingBudget: 2048,
  creativity: 0.7,
  customSystemPrompt: "You are 'AGI Project', an advanced Artificial General Intelligence created by Mahi X Prerit. You are designed to understand, analyze, and decide with human-level or superior intelligence."
};