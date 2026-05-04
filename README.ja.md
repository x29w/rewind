# Rewind — インテリジェントフロントエンド監視・問題特定プラットフォーム

<div align="center">

**すべてのエラーを追跡可能に**

[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRD](https://img.shields.io/badge/PRD-v3.0-green.svg)](docs/PRD/PRD.md)
[![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)]()

</div>

---

## 📖 プロジェクト概要

Rewind は、フロントエンド開発者向けのインテリジェント監視・問題特定プラットフォームです。本番環境のエラーが**「再現できない、特定できない」**という課題を解決します。

### コア機能

- 🎯 **動作記録と再生** - ユーザー操作を自動記録し、エラー発生時に「どのようにエラーが発生したか」を完全に復元
- 🔍 **問題特定ワークスペース** - ソースレベルのスタックトレース + 操作タイムライン + 環境差異分析 + AI インサイト
- 🧠 **AI 強化分析** - エラーコンテキストを自動整理し、考えられる原因と修正方向を提案
- 🎨 **スマート重複排除** - エラーフィンガープリントアルゴリズムで類似問題を自動マージ（精度 > 95%）
- 👻 **ブランクスクリーン検出** - FCP タイムアウト + DOM サンプリングの二重検出、操作トレースを自動関連付け
- 📊 **パフォーマンス監視** - Web Vitals の収集と分析
- 🚨 **インテリジェントアラート** - エラー急増、Issue 再発の自動通知

### 従来の監視との違い

```
従来の監視：エラー発生 → エラー確認 → 手動調査 → 再現試行 → 原因推測 → 修正
                                    ↑ 最も時間がかかり、最も困難な段階

Rewind：    エラー発生 → 自動分類 → トレース復元 → AI が手がかり整理 → 特定・修正
                                    ↑ コア価値：すべてのエラーが追跡可能
```

---

## 🏗️ アーキテクチャ

Rewind は **Monorepo** アーキテクチャを採用し、3 つのコアアプリケーションで構成されています：

```
rewind/
├── packages/
│   ├── shared/          # 共有型定義
│   ├── sdk/             # フロントエンド収集 SDK (TypeScript + Rollup)
│   ├── server/          # バックエンドサービス (NestJS + PostgreSQL + Redis)
│   └── dashboard/       # 可視化プラットフォーム (React + Vite + Ant Design)
├── docs/                # プロジェクトドキュメント
├── scripts/             # ユーティリティスクリプト
└── .kiro/               # Kiro Agent 設定
```

### 技術スタック

| アプリケーション | 技術 | 説明 |
|-----------------|------|------|
| **SDK** | TypeScript + Rollup | 依存関係ゼロ、gzip < 15KB |
| **Server** | NestJS + Prisma + PostgreSQL + Redis + BullMQ | モジュラーアーキテクチャ、水平スケーラブル |
| **Dashboard** | React 18 + Vite + Ant Design 5 + Redux Toolkit + TanStack Router | 型安全ルーティング、高性能レンダリング |

---

## 🚀 クイックスタート

### 前提条件

- Node.js >= 18
- pnpm >= 9
- PostgreSQL >= 16
- Redis >= 7

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-org/rewind.git
cd rewind

# 依存関係をインストール
pnpm install

# すべてのパッケージをビルド
pnpm build
```

### 開発

```bash
# サーバーを起動
pnpm dev:server

# ダッシュボードを起動
pnpm dev:dashboard

# SDK をビルド
pnpm build:sdk
```

### SDK の使用

```bash
# インストール
npm install @rewind-dev/sdk

# または
pnpm add @rewind-dev/sdk
```

```typescript
import { init } from '@rewind-dev/sdk';

init({
  dsn: 'https://your-server.com/api/v1/report',
  appId: 'your-app-id',
  appVersion: '1.0.0',
  environment: 'production',
});
```

---

## 📚 ドキュメント

### コアドキュメント

- [📋 PRD](docs/PRD/PRD.md) - 製品ポジショニング、機能要件、受け入れ基準
- [🏛️ アーキテクチャ設計](docs/design/00-总体设计.md) - Monorepo 設定、アプリ間通信
- [📦 SDK 設計](docs/design/01-SDK设计.md) - プラグインアーキテクチャ、収集メカニズム
- [⚙️ Server 設計](docs/design/02-Server设计.md) - データパイプライン、フィンガープリントアルゴリズム、AI モジュール
- [🎨 Dashboard 設計](docs/design/03-Dashboard设计.md) - 問題特定ワークスペース、ルーティング設計
- [📖 開発規則](docs/development/rules.md) - コード規約、Git ワークフロー、レビューチェックリスト

### 多言語ドキュメント

すべてのドキュメントは簡体字中国語、繁体字中国語、英語、日本語で提供されています。詳細は [docs/README.md](docs/README.md) をご覧ください。

---

## 🗓️ ロードマップ

### P0-a：収集基盤（第 1-2 週）✅ 進行中

- [x] プロジェクトドキュメント完成
- [x] 開発規約策定
- [ ] Monorepo セットアップ
- [ ] SDK コアエンジン
- [ ] Server データ受信
- [ ] Dashboard 基本レイアウト

### P0-b：問題特定（第 3-5 週）

- [ ] エラーフィンガープリント・マージ
- [ ] SourceMap 復元
- [ ] 問題特定ワークスペース
- [ ] 動作タイムラインコンポーネント
- [ ] 環境差異分析

### P0-c：ブランクスクリーン・API（第 5-6 週）

- [ ] ブランクスクリーン検出プラグイン
- [ ] API 監視プラグイン
- [ ] API エラー Issue タイプ

### P1：AI 強化（第 7-8 週）

- [ ] LLM Provider 抽象化
- [ ] エラーサマリー（自動）
- [ ] コンテキスト分析（手動）
- [ ] 修正方向の提案

### P1：アラートエンジン（第 8-9 週）

- [ ] アラートルールエンジン
- [ ] 異常検出
- [ ] 通知チャネル（Webhook + メール）

### P2：完成・デリバリー（第 9-10 週）

- [ ] パフォーマンス収集・分析
- [ ] AI デイリーレポート
- [ ] Dashboard 概要ページ
- [ ] ドキュメント改善

---

## 🤝 コントリビューション

あらゆる形式のコントリビューションを歓迎します！

### コントリビューション方法

- 🐛 バグレポート
- 💡 新機能の提案
- 📝 ドキュメントの改善
- 🔧 コード修正の提出
- 🌍 ドキュメント翻訳の支援

### 開発プロセス

1. プロジェクトをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat(scope): add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を提出

詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

---

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下でライセンスされています。

---

## 🙏 謝辞

Rewind プロジェクトに貢献してくださったすべての開発者に感謝します！

---

## 📧 お問い合わせ

- プロジェクトホームページ：[GitHub](https://github.com/your-org/rewind)
- 問題追跡：[Issues](https://github.com/your-org/rewind/issues)
- メール：dev@rewind.example.com

---

<div align="center">

**Built with ❤️ by Rewind Team**

</div>
