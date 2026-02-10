import request, { type ApiResponse } from './index';

// 资产变动记录类型 (对应后端 Prisma 模型返回)
export interface AssetEvent {
  id: string; // BigInt 序列化后为 String
  type: 'WITHDRAWAL' | 'INTEREST' | 'CALIBRATION' | 'DEPOSIT';
  category?: string;
  amount: number;
  occurredAt: string; // ISO Date String
  note?: string;
}

// 提交表单 DTO
export interface CreateAssetEventDto {
  type: string;
  category?: string;
  amount: number;
  occurredAt: string;
  note?: string;
}

// 获取流水列表
export const getAssetEvents = () => {
  return request.get<any, ApiResponse<AssetEvent[]>>('/assets/events');
};

// 提交新变动
export const createAssetEvent = (data: CreateAssetEventDto) => {
  return request.post<any, ApiResponse<AssetEvent>>('/assets/event', data);
};