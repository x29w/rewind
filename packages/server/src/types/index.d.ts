/**
 * Server 类型定义入口文件
 * Server Type Definitions Entry File
 * Server タイプ定義エントリーファイル
 * Server 類型定義入口檔案
 * 
 * @description_zh 此文件引用所有业务模块的类型定义，提供统一的类型访问入口
 * @description_en This file references all business module type definitions, providing unified type access
 * @description_ja このファイルはすべてのビジネスモジュールのタイプ定義を参照し、統一されたタイプアクセスを提供
 * @description_tw 此檔案引用所有業務模組的類型定義，提供統一的類型存取入口
 */

/// <reference path="./dto.d.ts" />
/// <reference path="./ai.d.ts" />
/// <reference path="./alert.d.ts" />
/// <reference path="./project.d.ts" />
/// <reference path="./issue.d.ts" />
/// <reference path="./ingestion.d.ts" />
/// <reference path="./entity.d.ts" />
/// <reference path="./config.d.ts" />
/// <reference path="./utils.d.ts" />
/// <reference path="./middleware.d.ts" />

/**
 * 缓存服务相关类型
 * @description_zh 缓存服务的类型定义
 * @description_en Cache service type definitions
 * @description_ja キャッシュサービスのタイプ定義
 * @description_tw 快取服務的類型定義
 */
declare namespace Cache {
  /**
   * 获取缓存参数
   * @description_zh 获取缓存值时需要的参数
   * @description_en Parameters required for getting cache value
   * @description_ja キャッシュ値取得に必要なパラメータ
   * @description_tw 獲取快取值時需要的參數
   */
  interface GetParams<T> {
    key: string;
  }

  /**
   * 设置缓存参数
   * @description_zh 设置缓存值时需要的参数
   * @description_en Parameters required for setting cache value
   * @description_ja キャッシュ値設定に必要なパラメータ
   * @description_tw 設定快取值時需要的參數
   */
  interface SetParams<T> {
    key: string;
    value: T;
    ttl?: number;
  }

  /**
   * 获取或设置缓存参数
   * @description_zh 获取或设置缓存值时需要的参数
   * @description_en Parameters required for getting or setting cache value
   * @description_ja キャッシュ値取得または設定に必要なパラメータ
   * @description_tw 獲取或設定快取值時需要的參數
   */
  interface GetOrSetParams<T> {
    key: string;
    factory: () => Promise<T>;
    ttl?: number;
  }

  /**
   * 删除缓存参数
   * @description_zh 删除缓存值时需要的参数
   * @description_en Parameters required for deleting cache value
   * @description_ja キャッシュ値削除に必要なパラメータ
   * @description_tw 刪除快取值時需要的參數
   */
  interface DeleteParams {
    key: string;
  }

  /**
   * 清空缓存参数
   * @description_zh 清空缓存时需要的参数
   * @description_en Parameters required for clearing cache
   * @description_ja キャッシュクリアに必要なパラメータ
   * @description_tw 清空快取時需要的參數
   */
  interface ClearParams {
    pattern?: string;
  }
}