/** API client — wraps Axios with the backend base URL and typed response handling. */

import axios from 'axios';
import { AnalysisRequest, AnalysisResult, ApiResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function analyzeRepository(url: string): Promise<AnalysisResult> {
  try {
    const response = await api.post<ApiResponse<AnalysisResult>>('/analyze', {
      url,
    } as AnalysisRequest);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Analysis failed');
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error(error.message || 'Failed to analyze repository');
  }
}
