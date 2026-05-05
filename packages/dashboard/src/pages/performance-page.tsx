/**
 * 性能分析页面
 * Performance Analysis Page
 * パフォーマンス分析ページ
 * 效能分析頁面
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, DatePicker, Select, Spin, Tag, Progress } from 'antd';
import { 
  ThunderboltOutlined, 
  RocketOutlined, 
  DashboardOutlined,
  FieldTimeOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import * as echarts from 'echarts';
import { 
  getPerformanceOverview, 
  getPagePerformanceRanking, 
  getPerformanceTrend 
} from '../api';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Web Vitals 阈值配置
 * Web Vitals Threshold Configuration
 * Web Vitals しきい値設定
 * Web Vitals 閾值配置
 */
const THRESHOLDS: Record<string, Performance.ThresholdConfig> = {
  fcp: { good: 1800, needsImprovement: 3000 },
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  ttfb: { good: 800, needsImprovement: 1800 },
};

/**
 * 获取性能评分等级
 * Get performance score level
 * パフォーマンススコアレベルを取得
 * 獲取效能評分等級
 */
function getScoreLevel(value: number, metric: string): Performance.ScoreLevel {
  const threshold = THRESHOLDS[metric];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * 获取评分等级颜色
 * Get score level color
 * スコアレベルの色を取得
 * 獲取評分等級顏色
 */
function getScoreLevelColor(level: Performance.ScoreLevel): string {
  switch (level) {
    case 'good':
      return '#52c41a';
    case 'needs-improvement':
      return '#faad14';
    case 'poor':
      return '#f5222d';
  }
}

/**
 * 获取评分等级图标
 * Get score level icon
 * スコアレベルのアイコンを取得
 * 獲取評分等級圖示
 */
function getScoreLevelIcon(level: Performance.ScoreLevel) {
  switch (level) {
    case 'good':
      return <CheckCircleOutlined />;
    case 'needs-improvement':
      return <WarningOutlined />;
    case 'poor':
      return <CloseCircleOutlined />;
  }
}

/**
 * 格式化时间
 * Format time
 * 時間をフォーマット
 * 格式化時間
 */
function formatTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * 性能分析页面组件
 * Performance Analysis Page Component
 * パフォーマンス分析ページコンポーネント
 * 效能分析頁面元件
 */
export function PerformancePage() {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<Performance.OverviewData | null>(null);
  const [pageRanking, setPageRanking] = useState<Performance.PagePerformance[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);

  /**
   * 加载性能概览数据
   * Load performance overview data
   * パフォーマンス概要データを読み込む
   * 載入效能概覽資料
   */
  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await getPerformanceOverview({
        startTime: dateRange[0].toISOString(),
        endTime: dateRange[1].toISOString(),
      });
      setOverview(data);
    } catch (error) {
      console.error('Failed to load performance overview:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载页面排行数据
   * Load page ranking data
   * ページランキングデータを読み込む
   * 載入頁面排行資料
   */
  const loadPageRanking = async () => {
    try {
      const data = await getPagePerformanceRanking({
        startTime: dateRange[0].toISOString(),
        endTime: dateRange[1].toISOString(),
      });
      setPageRanking(data);
      if (data.length > 0 && !selectedPage) {
        setSelectedPage(data[0].pageUrl);
      }
    } catch (error) {
      console.error('Failed to load page ranking:', error);
    }
  };

  /**
   * 加载性能趋势数据
   * Load performance trend data
   * パフォーマンストレンドデータを読み込む
   * 載入效能趨勢資料
   */
  const loadTrend = async () => {
    if (!selectedPage) return;

    try {
      const data = await getPerformanceTrend({
        pageUrl: selectedPage,
        startTime: dateRange[0].toISOString(),
        endTime: dateRange[1].toISOString(),
      });

      renderTrendChart(data);
    } catch (error) {
      console.error('Failed to load performance trend:', error);
    }
  };

  /**
   * 渲染趋势图表
   * Render trend chart
   * トレンドチャートをレンダリング
   * 渲染趨勢圖表
   */
  const renderTrendChart = (data: Performance.TrendDataPoint[]) => {
    const chartDom = document.getElementById('trend-chart');
    if (!chartDom) return;

    const chart = echarts.init(chartDom);

    const option: echarts.EChartsOption = {
      title: {
        text: '性能趋势 / Performance Trend / パフォーマンストレンド / 效能趨勢',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = dayjs(params[0].axisValue).format('YYYY-MM-DD HH:mm');
          let result = `${date}<br/>`;
          params.forEach((param: any) => {
            result += `${param.marker} ${param.seriesName}: ${formatTime(param.value)}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ['FCP', 'LCP', 'FID', 'TTFB'],
        top: 30,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: '时间 (ms) / Time (ms) / 時間 (ms) / 時間 (ms)',
        axisLabel: {
          formatter: (value: number) => formatTime(value),
        },
      },
      series: [
        {
          name: 'FCP',
          type: 'line',
          smooth: true,
          data: data.map((d) => [d.timestamp, d.fcpP75]),
          itemStyle: { color: '#1890ff' },
        },
        {
          name: 'LCP',
          type: 'line',
          smooth: true,
          data: data.map((d) => [d.timestamp, d.lcpP75]),
          itemStyle: { color: '#52c41a' },
        },
        {
          name: 'FID',
          type: 'line',
          smooth: true,
          data: data.map((d) => [d.timestamp, d.fidP75]),
          itemStyle: { color: '#faad14' },
        },
        {
          name: 'TTFB',
          type: 'line',
          smooth: true,
          data: data.map((d) => [d.timestamp, d.ttfbP75]),
          itemStyle: { color: '#722ed1' },
        },
      ],
    };

    chart.setOption(option);

    // 响应式调整
    // Responsive resize
    // レスポンシブリサイズ
    // 響應式調整
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartDom);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  };

  /**
   * 初始化加载
   * Initial load
   * 初期読み込み
   * 初始化載入
   */
  useEffect(() => {
    loadOverview();
    loadPageRanking();
  }, [dateRange]);

  /**
   * 加载趋势图表
   * Load trend chart
   * トレンドチャートを読み込む
   * 載入趨勢圖表
   */
  useEffect(() => {
    if (selectedPage) {
      loadTrend();
    }
  }, [selectedPage, dateRange]);

  /**
   * 页面排行表格列定义
   * Page ranking table column definition
   * ページランキングテーブル列定義
   * 頁面排行表格欄位定義
   */
  const columns = [
    {
      title: '页面 URL / Page URL / ページ URL / 頁面 URL',
      dataIndex: 'pageUrl',
      key: 'pageUrl',
      ellipsis: true,
    },
    {
      title: 'LCP P75',
      dataIndex: 'lcpP75',
      key: 'lcpP75',
      render: (value: number) => {
        const level = getScoreLevel(value, 'lcp');
        return (
          <Tag color={getScoreLevelColor(level)} icon={getScoreLevelIcon(level)}>
            {formatTime(value)}
          </Tag>
        );
      },
      sorter: (a: Performance.PagePerformance, b: Performance.PagePerformance) => b.lcpP75 - a.lcpP75,
    },
    {
      title: 'FCP P75',
      dataIndex: 'fcpP75',
      key: 'fcpP75',
      render: (value: number) => {
        const level = getScoreLevel(value, 'fcp');
        return (
          <Tag color={getScoreLevelColor(level)} icon={getScoreLevelIcon(level)}>
            {formatTime(value)}
          </Tag>
        );
      },
    },
    {
      title: 'FID P75',
      dataIndex: 'fidP75',
      key: 'fidP75',
      render: (value: number) => {
        const level = getScoreLevel(value, 'fid');
        return (
          <Tag color={getScoreLevelColor(level)} icon={getScoreLevelIcon(level)}>
            {formatTime(value)}
          </Tag>
        );
      },
    },
    {
      title: 'CLS P75',
      dataIndex: 'clsP75',
      key: 'clsP75',
      render: (value: number) => {
        const level = getScoreLevel(value, 'cls');
        return (
          <Tag color={getScoreLevelColor(level)} icon={getScoreLevelIcon(level)}>
            {value.toFixed(3)}
          </Tag>
        );
      },
    },
    {
      title: '样本数 / Samples / サンプル数 / 樣本數',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和筛选器 / Page title and filters / ページタイトルとフィルター / 頁面標題和篩選器 */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>
          <DashboardOutlined /> 性能分析 / Performance Analysis / パフォーマンス分析 / 效能分析
        </h1>
        <RangePicker
          value={dateRange}
          onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
          presets={[
            { label: '最近 24 小时 / Last 24 Hours / 過去24時間 / 最近 24 小時', value: [dayjs().subtract(1, 'day'), dayjs()] },
            { label: '最近 7 天 / Last 7 Days / 過去7日間 / 最近 7 天', value: [dayjs().subtract(7, 'day'), dayjs()] },
            { label: '最近 30 天 / Last 30 Days / 過去30日間 / 最近 30 天', value: [dayjs().subtract(30, 'day'), dayjs()] },
          ]}
        />
      </div>

      <Spin spinning={loading}>
        {/* Web Vitals 概览卡片 / Web Vitals Overview Cards / Web Vitals 概要カード / Web Vitals 概覽卡片 */}
        {overview && (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {/* FCP Card */}
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <ThunderboltOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#8c8c8c' }}>FCP (First Contentful Paint)</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatTime(overview.fcp.p75)}</div>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>达标率 / Pass Rate / 達成率 / 達標率: </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: getScoreLevelColor(getScoreLevel(overview.fcp.p75, 'fcp')) }}>
                    {overview.fcp.passRate.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  percent={overview.fcp.passRate} 
                  strokeColor={getScoreLevelColor(getScoreLevel(overview.fcp.p75, 'fcp'))}
                  showInfo={false}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  P50: {formatTime(overview.fcp.p50)} | P95: {formatTime(overview.fcp.p95)}
                </div>
              </Card>
            </Col>

            {/* LCP Card */}
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <RocketOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#8c8c8c' }}>LCP (Largest Contentful Paint)</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatTime(overview.lcp.p75)}</div>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>达标率 / Pass Rate / 達成率 / 達標率: </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: getScoreLevelColor(getScoreLevel(overview.lcp.p75, 'lcp')) }}>
                    {overview.lcp.passRate.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  percent={overview.lcp.passRate} 
                  strokeColor={getScoreLevelColor(getScoreLevel(overview.lcp.p75, 'lcp'))}
                  showInfo={false}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  P50: {formatTime(overview.lcp.p50)} | P95: {formatTime(overview.lcp.p95)}
                </div>
              </Card>
            </Col>

            {/* FID Card */}
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <FieldTimeOutlined style={{ fontSize: '24px', color: '#faad14', marginRight: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#8c8c8c' }}>FID (First Input Delay)</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatTime(overview.fid.p75)}</div>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>达标率 / Pass Rate / 達成率 / 達標率: </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: getScoreLevelColor(getScoreLevel(overview.fid.p75, 'fid')) }}>
                    {overview.fid.passRate.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  percent={overview.fid.passRate} 
                  strokeColor={getScoreLevelColor(getScoreLevel(overview.fid.p75, 'fid'))}
                  showInfo={false}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  P50: {formatTime(overview.fid.p50)} | P95: {formatTime(overview.fid.p95)}
                </div>
              </Card>
            </Col>

            {/* CLS Card */}
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <DashboardOutlined style={{ fontSize: '24px', color: '#722ed1', marginRight: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#8c8c8c' }}>CLS (Cumulative Layout Shift)</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{overview.cls.p75.toFixed(3)}</div>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>达标率 / Pass Rate / 達成率 / 達標率: </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: getScoreLevelColor(getScoreLevel(overview.cls.p75, 'cls')) }}>
                    {overview.cls.passRate.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  percent={overview.cls.passRate} 
                  strokeColor={getScoreLevelColor(getScoreLevel(overview.cls.p75, 'cls'))}
                  showInfo={false}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  P50: {overview.cls.p50.toFixed(3)} | P95: {overview.cls.p95.toFixed(3)}
                </div>
              </Card>
            </Col>

            {/* TTFB Card */}
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <FieldTimeOutlined style={{ fontSize: '24px', color: '#eb2f96', marginRight: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#8c8c8c' }}>TTFB (Time to First Byte)</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatTime(overview.ttfb.p75)}</div>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>达标率 / Pass Rate / 達成率 / 達標率: </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: getScoreLevelColor(getScoreLevel(overview.ttfb.p75, 'ttfb')) }}>
                    {overview.ttfb.passRate.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  percent={overview.ttfb.passRate} 
                  strokeColor={getScoreLevelColor(getScoreLevel(overview.ttfb.p75, 'ttfb'))}
                  showInfo={false}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  P50: {formatTime(overview.ttfb.p50)} | P95: {formatTime(overview.ttfb.p95)}
                </div>
              </Card>
            </Col>

            {/* 样本数卡片 / Sample Count Card / サンプル数カード / 樣本數卡片 */}
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <CheckCircleOutlined style={{ fontSize: '24px', color: '#13c2c2', marginRight: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#8c8c8c' }}>样本数量 / Sample Count / サンプル数 / 樣本數量</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{overview.sampleCount.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  数据来源于选定时间范围内的性能采集
                  <br />
                  Data from performance collection in selected time range
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* 慢页面排行 / Slow Pages Ranking / 遅いページランキング / 慢頁面排行 */}
        <Card 
          title="慢页面排行 / Slow Pages Ranking / 遅いページランキング / 慢頁面排行" 
          style={{ marginBottom: '24px' }}
        >
          <Table
            columns={columns}
            dataSource={pageRanking}
            rowKey="pageUrl"
            pagination={{ pageSize: 10 }}
            onRow={(record) => ({
              onClick: () => setSelectedPage(record.pageUrl),
              style: { cursor: 'pointer' },
            })}
          />
        </Card>

        {/* 性能趋势图表 / Performance Trend Chart / パフォーマンストレンドチャート / 效能趨勢圖表 */}
        <Card 
          title="性能趋势 / Performance Trend / パフォーマンストレンド / 效能趨勢"
          extra={
            <Select
              style={{ width: 400 }}
              value={selectedPage}
              onChange={setSelectedPage}
              placeholder="选择页面 / Select Page / ページを選択 / 選擇頁面"
            >
              {pageRanking.map((page) => (
                <Option key={page.pageUrl} value={page.pageUrl}>
                  {page.pageUrl}
                </Option>
              ))}
            </Select>
          }
        >
          <div id="trend-chart" style={{ width: '100%', height: '400px' }} />
        </Card>
      </Spin>
    </div>
  );
}
