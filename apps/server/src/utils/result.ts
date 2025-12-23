import { Response } from 'express';
import { ApiCode, ApiResponse } from '@repo/shared';

export class Result {
  static success<T>(res: Response, data: T, msg = '操作成功') {
    const response: ApiResponse<T> = {
      code: ApiCode.SUCCESS, // = 200
      data,
      msg,
    };
    return res.status(200).json(response);
  }
  
  static fail(res: Response, msg = '操作失败', code = ApiCode.FAIL, httpStatus = 200) {
    const response: ApiResponse<null> = {
      code, // 默认为 500
      data: null,
      msg,
    };
    // 依然维持 HTTP 200，但 Body 里 code=500/401，这是国内常见的包装模式
    return res.status(httpStatus).json(response);
  }
}
