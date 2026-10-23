
import axios from 'axios';
import type {
  ApiResponse,
  GenerationParams,
  GenerationResult,
  HealthStatus,
  ModelOption,
} from '../types';

// Production backend hosted on Render
const RENDER_BACKEND_URL = 'https://mockup-studio-ai.onrender.com';

// Use Render in production and local Vite proxy in development

const API_BASE_URL = 'https://mockup-studio-ai.onrender.com/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 130_000,
});

// Generate mockup image
export async function generateImage(
  file: File,
  params: GenerationParams
): Promise<GenerationResult> {
  const formData = new FormData();

  formData.append('image', file);
  formData.append('prompt', params.prompt);
  formData.append('aspectRatio', params.aspectRatio);
  formData.append('model', params.model);
  formData.append('outputFormat', params.outputFormat);
  formData.append('strength', String(params.strength));

  if (params.negativePrompt) {
    formData.append('negativePrompt', params.negativePrompt);
  }

  if (params.seed !== undefined) {
    formData.append('seed', String(params.seed));
  }

  if (params.category) {
    formData.append('category', params.category);
  }

  if (params.scenePreset) {
    formData.append('scenePreset', params.scenePreset);
  }

  if (params.workflow) {
    formData.append('workflow', params.workflow);
  }

  if (params.removeBackground !== undefined) {
    formData.append(
      'removeBackground',
      String(params.removeBackground)
    );
  }

  if (params.productScale !== undefined) {
    formData.append(
      'productScale',
      String(params.productScale)
    );
  }

  if (params.positionX !== undefined) {
    formData.append('positionX', String(params.positionX));
  }

  if (params.positionY !== undefined) {
    formData.append('positionY', String(params.positionY));
  }

  if (params.contactShadow !== undefined) {
    formData.append(
      'contactShadow',
      String(params.contactShadow)
    );
  }

  if (params.colorMatch !== undefined) {
    formData.append(
      'colorMatch',
      String(params.colorMatch)
    );
  }

  if (params.debug !== undefined) {
    formData.append('debug', String(params.debug));
  }

  const response = await api.post<
    ApiResponse<GenerationResult>
  >('/generate', formData);

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Generation failed.'
    );
  }

  return response.data.data;
}

// Backend health check
export async function getHealth(): Promise<HealthStatus> {
  const response = await api.get<ApiResponse<HealthStatus>>(
    '/health'
  );

  if (!response.data.success || !response.data.data) {
    throw new Error('Health check failed');
  }

  return response.data.data;
}

// Available AI models
export async function getModels(): Promise<ModelOption[]> {
  const response = await api.get<
    ApiResponse<{ models: ModelOption[] }>
  >('/models');

  if (!response.data.success || !response.data.data) {
    throw new Error('Failed to load models');
  }

  return response.data.data.models;
}

// API error handling
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | ApiResponse<unknown>
      | undefined;

    if (data?.error?.message) {
      return data.error.message;
    }

    if (error.response?.status === 404) {
      return 'API endpoint not found. Check your Render backend routes.';
    }

    if (error.response?.status === 413) {
      return 'File too large. Please upload an image under 10 MB.';
    }

    if (error.response?.status === 429) {
      return 'Too many requests. Please wait a moment before trying again.';
    }

    if (error.response?.status === 401) {
      return 'Invalid API key. Please check your server configuration.';
    }

    if (error.response?.status === 402) {
      return 'Insufficient credits. Please top up your Stability AI account.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }

    if (!error.response) {
      return 'Cannot connect to Render backend. Check server availability and CORS configuration.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
