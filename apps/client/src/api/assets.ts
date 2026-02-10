import request, { type ApiResponse } from './index';

export interface AssetEvent {
  id: string;
  type: 'WITHDRAWAL' | 'INTEREST' | 'CALIBRATION' | 'DEPOSIT';
  category?: string;
  amount: number;
  occurredAt: string;
  note?: string;
}

export interface CreateAssetEventDto {
  type: string;
  category?: string;
  amount: number;
  occurredAt: string;
  note?: string;
}

// [修改] 增加 params 参数
export const getAssetEvents = (params?: { limit?: number }) => {
  return request.get<any, ApiResponse<AssetEvent[]>>('/assets/events', { params });
};

export const createAssetEvent = (data: CreateAssetEventDto) => {
  return request.post<any, ApiResponse<AssetEvent>>('/assets/event', data);
};

export const deleteAssetEvent = (id: string) => {
  return request.delete<any, ApiResponse<void>>(`/assets/event/${id}`);
};