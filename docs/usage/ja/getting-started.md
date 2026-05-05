# Rewind 使用ガイド

## 概要

Rewind は、3つのコアコンポーネントで構成されるインテリジェントなフロントエンド監視プラットフォームです：

1. **SDK** - フロントエンドデータ収集ライブラリ、アプリケーションに統合
2. **Server** - データ処理、保存、分析、AI機能のためのバックエンドサービス
3. **Dashboard** - 監視データの表示と管理のための可視化プラットフォーム

## 全体的な実装フロー

```
ユーザーアプリ → SDK収集 → Server処理 → Dashboard表示
    ↓           ↓          ↓           ↓
  SDK統合    自動レポート  スマート分析  問題特定
```

### 詳細プロセス

1. **データ収集フェーズ**
   - SDKが自動的にエラー、ユーザー行動、パフォーマンスデータをキャプチャ
   - ブレッドクラムトレイル（クリック、ナビゲーション、API呼び出しなど）のリアルタイム記録
   - ブランクスクリーン、API異常などの特殊シナリオの検出

2. **データ処理フェーズ**
   - ServerがSDKから報告されたデータを受信
   - フィンガープリントアルゴリズムを使用して類似問題を自動集約
   - AIがエラー原因を分析し、修正提案を提供
   - インテリジェントアラートルールをトリガー

3. **問題特定フェーズ**
   - Dashboardが問題リストと詳細を表示
   - 完全なユーザー操作トレースリプレイを提供
   - エラースタック、環境情報、AI分析結果を表示
   - 問題ステータス管理とチーム協力をサポート

---

## I. クイックスタート

### 1.1 Rewindプラットフォームのデプロイ

#### Dockerを使用（推奨）

```bash
# 1. プロジェクトをクローン
git clone https://github.com/your-org/rewind.git
cd rewind

# 2. 環境変数を設定
cp .env.example .env
# .envファイルを編集し、データベースパスワード、JWTシークレットなどを設定

# 3. すべてのサービスを開始
docker-compose up -d

# 4. Dashboardにアクセス
# http://localhost - Dashboardインターフェース
# http://localhost:3000 - Server API
# http://localhost:3000/api-docs - APIドキュメント
```

詳細なデプロイ手順については、[デプロイガイド](../deployment/ja/deployment.md)を参照してください

### 1.2 プロジェクト作成

1. Dashboard にアクセス: http://localhost
2. アカウント登録とログイン
3. 新しいプロジェクトを作成し、**App ID** と **API Key** を取得

---

## II. SDK統合使用

### 2.1 SDKインストール

```bash
# npm
npm install @rewind-dev/sdk

# pnpm
pnpm add @rewind-dev/sdk

# yarn
yarn add @rewind-dev/sdk
```

### 2.2 基本統合

#### 2.2.1 最小統合

```typescript
import { init } from '@rewind-dev/sdk';

// アプリ開始時に初期化
init({
  dsn: 'http://localhost:3000/api/v1/report',  // Serverアドレス
  appId: 'your-app-id',                        // Dashboardから取得
  appVersion: '1.0.0',                         // アプリバージョン
  environment: 'production',                   // 環境識別子
});
```

#### 2.2.2 完全設定

```typescript
import { init } from '@rewind-dev/sdk';

const client = init({
  // 必須設定
  dsn: 'http://localhost:3000/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  
  // オプション設定
  environment: 'production',           // 環境: development, staging, production
  sampleRate: 1.0,                    // サンプリングレート: 0.0-1.0、1.0は100%サンプリング
  maxBreadcrumbs: 100,                // ブレッドクラム最大数
  enabled: true,                      // SDKを有効にするか
  debug: false,                       // デバッグモード
  
  // ユーザー情報
  user: {
    id: 'user-123',
    email: 'user@example.com',
    username: 'john_doe'
  },
  
  // カスタムタグ
  tags: {
    team: 'frontend',
    feature: 'checkout'
  },
  
  // プラグイン設定
  enableBlankScreenDetection: true,   // ブランクスクリーン検出を有効
  enableApiMonitoring: true,          // API監視を有効
});
```

### 2.3 手動レポート

#### 2.3.1 エラーキャプチャ

```typescript
import { getClient } from '@rewind-dev/sdk';

const client = getClient();

try {
  // エラーが発生する可能性のあるコード
  riskyOperation();
} catch (error) {
  // 手動でエラーをレポート
  client?.captureError(error, {
    extra: {
      userId: '123',
      action: 'checkout',
      step: 'payment'
    }
  });
}
```

#### 2.3.2 ブレッドクラム追加

```typescript
import { getClient } from '@rewind-dev/sdk';

const client = getClient();

// カスタムブレッドクラムを追加
client?.addBreadcrumb({
  type: 'user',
  message: 'ユーザーが購入ボタンをクリック',
  timestamp: Date.now(),
  level: 'info',
  category: 'ui',
  data: {
    buttonId: 'buy-now',
    productId: 'prod-123'
  }
});
```

### 2.4 フレームワーク統合例

#### 2.4.1 React統合

```typescript
// src/utils/monitoring.ts
import { init } from '@rewind-dev/sdk';

export const initMonitoring = () => {
  return init({
    dsn: process.env.REACT_APP_REWIND_DSN!,
    appId: process.env.REACT_APP_REWIND_APP_ID!,
    appVersion: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV,
    user: {
      id: localStorage.getItem('userId') || undefined,
    }
  });
};

// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initMonitoring } from './utils/monitoring';

// 監視を初期化
initMonitoring();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
```

#### 2.4.2 Vue統合

```typescript
// src/plugins/monitoring.ts
import { init } from '@rewind-dev/sdk';
import type { App } from 'vue';

export default {
  install(app: App) {
    const client = init({
      dsn: import.meta.env.VITE_REWIND_DSN,
      appId: import.meta.env.VITE_REWIND_APP_ID,
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE,
    });
    
    // グローバルエラーハンドリング
    app.config.errorHandler = (error, instance, info) => {
      client?.captureError(error as Error, {
        extra: { info, component: instance?.$options.name }
      });
    };
    
    app.provide('rewindClient', client);
  }
};

// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import monitoring from './plugins/monitoring';

const app = createApp(App);
app.use(monitoring);
app.mount('#app');
```

---

## III. Dashboard使用

### 3.1 プロジェクト管理

#### 3.1.1 プロジェクト作成

1. Dashboardにログイン
2. 「新しいプロジェクト」をクリック
3. プロジェクト情報を入力：
   - プロジェクト名
   - プロジェクト説明
   - チームメンバー
4. App IDとAPI Keyを取得

#### 3.1.2 プロジェクト設定

- **基本設定**: プロジェクト名、説明、チームメンバー
- **アラートルール**: エラー数しきい値、通知チャンネル
- **データ保持**: 履歴データ保持期間
- **APIキー**: SDK アクセスキーの管理

### 3.2 問題管理

#### 3.2.1 問題リスト

- **フィルター機能**: ステータス、レベル、時間範囲でフィルター
- **検索機能**: エラーメッセージ、ファイル名で検索
- **ソート機能**: 発生時間、影響ユーザー数でソート
- **バッチ操作**: バッチで解決済み、無視をマーク

#### 3.2.2 問題詳細

**基本情報**
- エラーメッセージとスタック情報
- 発生時間と影響ユーザー数
- エラーレベルとステータス

**ユーザートレース**
- 完全なユーザー操作タイムライン
- クリック、ナビゲーション、API呼び出し記録
- エラー発生前の重要な操作

**環境情報**
- ブラウザ、オペレーティングシステム情報
- 画面解像度、デバイスタイプ
- ネットワーク状態、ページURL

**AI分析**
- エラー根本原因分析
- 可能な修正提案
- 類似問題推奨

---

## IV. Server API使用

### 4.1 認証

すべてのAPIリクエストはHeaderにAPI Keyを含める必要があります：

```http
POST /api/v1/report
Content-Type: application/json
X-API-Key: your-api-key

{
  "event": { ... }
}
```

### 4.2 イベントレポートAPI

#### 4.2.1 単一イベントレポート

```http
POST /api/v1/report
Content-Type: application/json
X-API-Key: your-api-key

{
  "event": {
    "type": "error",
    "message": "TypeError: Cannot read property 'name' of undefined",
    "timestamp": 1683360000000,
    "stack": "TypeError: Cannot read property...",
    "filename": "https://example.com/app.js",
    "lineno": 42,
    "colno": 15,
    "extra": {
      "userId": "user-123",
      "action": "checkout"
    },
    "tags": {
      "environment": "production",
      "version": "1.0.0"
    },
    "breadcrumbs": [...],
    "deviceInfo": {...}
  }
}
```

---

## V. ベストプラクティス

### 5.1 SDK統合ベストプラクティス

#### 5.1.1 エラーバウンダリ

```typescript
// React エラーバウンダリ例
import React from 'react';
import { getClient } from '@rewind-dev/sdk';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const client = getClient();
    client?.captureError(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });
  }
  
  render() {
    // エラーUI レンダリングロジック
  }
}
```

### 5.2 パフォーマンス最適化

#### 5.2.1 サンプリング戦略

```typescript
// 環境とユーザータイプに基づいてサンプリングレートを設定
const getSampleRate = () => {
  if (process.env.NODE_ENV === 'development') {
    return 1.0;  // 開発環境で100%サンプリング
  }
  
  const userType = getUserType();
  switch (userType) {
    case 'internal': return 1.0;    // 内部ユーザー100%
    case 'beta': return 0.5;        // ベータユーザー50%
    case 'premium': return 0.2;     // プレミアムユーザー20%
    default: return 0.05;           // 一般ユーザー5%
  }
};

init({
  dsn: 'your-dsn',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  sampleRate: getSampleRate()
});
```

---

## VI. FAQ

### Q1: SDKはアプリケーションパフォーマンスに影響しますか？

**A:** SDKは慎重に最適化されており、アプリケーションパフォーマンスへの影響は最小限です：
- コアパッケージ < 15KB gzip圧縮
- 非同期レポート、メインスレッドをブロックしない
- スマートサンプリングでネットワークリクエストを削減
- 内蔵エラーハンドリングでアプリケーションクラッシュを防止

### Q2: 機密データの処理方法は？

**A:** 機密データを保護する複数の方法：
- `beforeSend`コールバックを使用して機密フィールドをフィルター
- サンプリングレートを設定してデータ収集を削減
- データ保持期間を設定、定期的なクリーンアップ
- オンプレミスデプロイをサポート、データは内部に留まる

### Q3: サポートされているブラウザは？

**A:** SDKはすべてのモダンブラウザをサポート：
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- モバイルブラウザ

---

## VII. 技術サポート

### 7.1 ドキュメントリソース

- **APIドキュメント**: http://localhost:3000/api-docs
- **デプロイガイド**: [docs/deployment/](../deployment/)
- **開発標準**: [docs/development/](../development/)
- **設計ドキュメント**: [docs/design/](../design/)

### 7.2 コミュニティサポート

- **GitHub Issues**: https://github.com/your-org/rewind/issues
- **ディスカッション**: https://github.com/your-org/rewind/discussions
- **変更ログ**: https://github.com/your-org/rewind/releases

### 7.3 商用サポート

- **技術コンサルティング**: support@rewind.dev
- **カスタム開発**: enterprise@rewind.dev
- **トレーニングサービス**: training@rewind.dev

---

**最終更新**: 2026年5月5日
**ドキュメントバージョン**: v1.0