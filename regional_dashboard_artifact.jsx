import React, { useState } from 'react';
import { ChevronRight, X, Star, MapPin, Users, TrendingUp, Package, Calendar } from 'lucide-react';

const RegionalDashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [viewPeriod, setViewPeriod] = useState('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  // 100人分のドライバーデータ生成
  const generateDriverData = () => {
    const regions = {
      '東京': ['品川', '新宿', '渋谷', '足立', '江戸川', '練馬', '世田谷'],
      '埼玉': ['さいたま', '川口', '川越', '所沢', '越谷', '草加', '春日部']
    };

    const drivers = [];
    let driverId = 1;

    Object.entries(regions).forEach(([region, areas]) => {
      areas.forEach(area => {
        for (let i = 1; i <= 7; i++) {
          const monthlyData = [1, 2, 3].map(month => {
            const workDays = 22 + Math.floor(Math.random() * 3);
            const targetMonthly = 2400;
            const dailyAvg = Math.floor(targetMonthly / workDays);
            const regularPerDay = Math.floor(dailyAvg * 0.7);
            const postingPerDay = Math.floor(dailyAvg * 0.3);
            const saleBonus = 40;
            const normalDays = Math.floor(workDays * 0.75);
            const saleDays = workDays - normalDays;
            const regularTotal = (regularPerDay * normalDays) + ((regularPerDay + saleBonus) * saleDays);
            const postingTotal = (postingPerDay * normalDays) + ((postingPerDay + saleBonus) * saleDays);
            const absentRate = 0.02 + (Math.random() * 0.02);
            const regularAbsent = Math.floor(regularTotal * absentRate);
            const postingAbsent = Math.floor(postingTotal * absentRate);
            const timeViolations = Math.random() > 0.9 ? 1 : 0;
            const timeViolationDetails = timeViolations > 0 ? [{
              date: `2026/${month}/${Math.floor(Math.random() * 28) + 1}`,
              timeSlot: ['午前08-12', '午後1 14-16', '午後2 16-18', '夕方18-20', '夜間19-21'][Math.floor(Math.random() * 5)],
              reason: ['道路渋滞', '配達先不在で時間超過', '前の配達が長引いた'][Math.floor(Math.random() * 3)]
            }] : [];
            const complaints = Math.random() > 0.9 ? 2 : (Math.random() > 0.5 ? 1 : 0);
            const complaintDetails = Array.from({ length: complaints }, (_, i) => ({
              date: `2026/${month}/${Math.floor(Math.random() * 28) + 1}`,
              type: ['配達遅延', '商品破損', '対応不良', '置き配指示無視'][Math.floor(Math.random() * 4)],
              detail: ['お客様からの指摘', '配達時のトラブル', '誤配達'][Math.floor(Math.random() * 3)],
              status: Math.random() > 0.5 ? '対応済み' : '対応中'
            }));
            const sameDayAbsences = Math.random() > 0.95 ? 1 : 0;
            let score = 5.0;
            score -= timeViolations * 0.2;
            score -= complaints * 0.5;
            score -= sameDayAbsences * 0.5;
            score = Math.max(1.0, Math.min(5.0, score));
            
            return {
              month,
              workDays,
              regularTotal,
              regularAbsent,
              regularCompleted: regularTotal - regularAbsent,
              postingTotal,
              postingAbsent,
              postingCompleted: postingTotal - postingAbsent,
              timeViolations,
              timeViolationDetails,
              complaints,
              complaintDetails,
              sameDayAbsences,
              accidents: 0,
              score: parseFloat(score.toFixed(1))
            };
          });

          const hasAccident = Math.random() > 0.98;
          const quarterlyData = {
            totalWorkDays: monthlyData.reduce((sum, m) => sum + m.workDays, 0),
            totalRegular: monthlyData.reduce((sum, m) => sum + m.regularCompleted, 0),
            totalPosting: monthlyData.reduce((sum, m) => sum + m.postingCompleted, 0),
            totalComplaints: monthlyData.reduce((sum, m) => sum + m.complaints, 0),
            totalAbsences: monthlyData.reduce((sum, m) => sum + m.sameDayAbsences, 0),
            avgScore: parseFloat((monthlyData.reduce((sum, m) => sum + m.score, 0) / 3).toFixed(1)),
            accidents: hasAccident ? 1 : 0,
            accidentDetails: hasAccident ? [{
              date: `2026/${Math.floor(Math.random() * 3) + 1}/${Math.floor(Math.random() * 28) + 1}`,
              type: '物損事故',
              situation: ['バック時に接触', '狭路で側面擦過', '駐車時の接触'][Math.floor(Math.random() * 3)],
              damage: '軽微な傷',
              status: '保険対応完了'
            }] : []
          };

          drivers.push({
            id: `DRV${String(driverId).padStart(3, '0')}`,
            name: `ドライバー ${driverId}`,
            region,
            area,
            monthly: monthlyData,
            quarterly: quarterlyData
          });

          driverId++;
        }
      });
    });

    return drivers;
  };

  const driversData = generateDriverData();

  const getRegionSummary = (region) => {
    const regionDrivers = driversData.filter(d => d.region === region);
    return {
      driverCount: regionDrivers.length,
      areaCount: [...new Set(regionDrivers.map(d => d.area))].length,
      avgScore: (regionDrivers.reduce((sum, d) => sum + d.quarterly.avgScore, 0) / regionDrivers.length).toFixed(1),
      totalDeliveries: regionDrivers.reduce((sum, d) => sum + d.quarterly.totalRegular + d.quarterly.totalPosting, 0)
    };
  };

  const getAreaSummary = (region, area) => {
    const areaDrivers = driversData.filter(d => d.region === region && d.area === area);
    return {
      driverCount: areaDrivers.length,
      avgScore: (areaDrivers.reduce((sum, d) => sum + d.quarterly.avgScore, 0) / areaDrivers.length).toFixed(1),
      totalDeliveries: areaDrivers.reduce((sum, d) => sum + d.quarterly.totalRegular + d.quarterly.totalPosting, 0),
      totalComplaints: areaDrivers.reduce((sum, d) => sum + d.quarterly.totalComplaints, 0)
    };
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return '#2e7d32';
    if (score >= 4.0) return '#66bb6a';
    if (score >= 3.0) return '#ffa726';
    return '#ef5350';
  };

  const RegionSelection = () => {
    const searchResults = searchQuery 
      ? driversData.filter(driver => 
          driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

    return (
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🗾 地域選択
        </h1>

        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 ドライバー名またはIDで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-xl px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <div className="mt-4 bg-white rounded-xl shadow-lg p-6 max-w-xl">
              <div className="text-sm text-gray-600 mb-3">
                {searchResults.length}件の結果
              </div>
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.slice(0, 5).map(driver => (
                    <div
                      key={driver.id}
                      onClick={() => {
                        setSelectedRegion(driver.region);
                        setSelectedArea(driver.area);
                        setSelectedDriver(driver);
                        setSearchQuery('');
                      }}
                      className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{driver.name}</div>
                          <div className="text-sm text-gray-600">
                            {driver.id} - {driver.region} {driver.area}
                          </div>
                        </div>
                        <div className="text-xl font-bold" style={{ color: getScoreColor(driver.quarterly.avgScore) }}>
                          ★ {driver.quarterly.avgScore}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  該当するドライバーが見つかりません
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {['東京', '埼玉'].map(region => {
            const summary = getRegionSummary(region);
            return (
              <div
                key={region}
                onClick={() => setSelectedRegion(region)}
                className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {region === '東京' ? '🏙️' : '🌸'} {region}
                    </h2>
                    <div className="text-sm text-gray-600">
                      {summary.areaCount}エリア · {summary.driverCount}名
                    </div>
                  </div>
                  <ChevronRight size={32} className="text-gray-400" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">平均評価</div>
                    <div className="text-2xl font-bold" style={{ color: getScoreColor(parseFloat(summary.avgScore)) }}>
                      ★ {summary.avgScore}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">総配達</div>
                    <div className="text-2xl font-bold text-green-700">
                      {(summary.totalDeliveries / 1000).toFixed(1)}k
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const AreaSelection = () => {
    const areas = selectedRegion === '東京' 
      ? ['品川', '新宿', '渋谷', '足立', '江戸川', '練馬', '世田谷']
      : ['さいたま', '川口', '川越', '所沢', '越谷', '草加', '春日部'];

    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              setSelectedRegion(null);
              setSelectedArea(null);
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
          >
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedRegion} - エリア選択
          </h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map(area => {
            const summary = getAreaSummary(selectedRegion, area);
            return (
              <div
                key={area}
                onClick={() => setSelectedArea(area)}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      📍 {area}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {summary.driverCount}名のドライバー
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">平均評価</span>
                    <span className="text-xl font-bold" style={{ color: getScoreColor(parseFloat(summary.avgScore)) }}>
                      ★ {summary.avgScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">総配達</span>
                    <span className="text-lg font-semibold text-gray-700">
                      {summary.totalDeliveries.toLocaleString()}個
                    </span>
                  </div>
                  {summary.totalComplaints > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">クレーム</span>
                      <span className="text-lg font-semibold text-red-600">
                        {summary.totalComplaints}件
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DriverList = () => {
    const drivers = driversData.filter(d => 
      d.region === selectedRegion && d.area === selectedArea
    );

    const getPeriodData = (driver) => {
      if (viewPeriod === 'quarterly') {
        return [{
          period: '2026 Q1 (1-3月)',
          data: driver.quarterly
        }];
      }
      return driver.monthly.map(m => ({
        period: `2026年${m.month}月`,
        data: m
      }));
    };

    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedArea(null)}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
          >
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedRegion} {selectedArea} - ドライバー一覧
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            {['monthly', 'quarterly'].map(period => (
              <button
                key={period}
                onClick={() => setViewPeriod(period)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  viewPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'monthly' ? '📅 月次表示' : '📊 四半期表示'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {drivers.map(driver => {
            const periodData = getPeriodData(driver);
            
            return (
              <div key={driver.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {driver.name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        ID: {driver.id}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDriver(driver)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      詳細を見る
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">期間</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">評価</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">一般荷物</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">ポスティング</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">時間不履行</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">クレーム</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">当日欠勤</th>
                        {viewPeriod === 'quarterly' && (
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">事故</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {periodData.map((period, idx) => {
                        const d = period.data;
                        const isQuarterly = viewPeriod === 'quarterly';
                        
                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm font-medium text-gray-700">
                              {period.period}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-xl font-bold" style={{ color: getScoreColor(isQuarterly ? d.avgScore : d.score) }}>
                                ★ {isQuarterly ? d.avgScore : d.score}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center text-sm">
                              <div className="font-semibold text-gray-700">
                                {isQuarterly ? d.totalRegular : d.regularCompleted}個
                              </div>
                              {!isQuarterly && d.regularAbsent > 0 && (
                                <div className="text-xs text-red-600">
                                  不在{d.regularAbsent}個
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center text-sm">
                              <div className="font-semibold text-gray-700">
                                {isQuarterly ? d.totalPosting : d.postingCompleted}個
                              </div>
                              {!isQuarterly && d.postingAbsent > 0 && (
                                <div className="text-xs text-red-600">
                                  不在{d.postingAbsent}個
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {isQuarterly ? (
                                <div>
                                  <div className="text-sm font-semibold text-gray-700">
                                    {driver.monthly.reduce((sum, m) => sum + m.timeViolations, 0)}件
                                  </div>
                                  {driver.monthly.reduce((sum, m) => sum + m.timeViolations, 0) > 0 && (
                                    <button
                                      onClick={() => {
                                        const allDetails = driver.monthly.flatMap(m => m.timeViolationDetails || []);
                                        setDetailModal({ type: 'timeViolation', data: allDetails });
                                      }}
                                      className="text-xs text-orange-600 hover:underline mt-1"
                                    >
                                      詳細
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <span className={`text-sm font-semibold ${d.timeViolations > 0 ? 'text-orange-600' : 'text-gray-700'}`}>
                                    {d.timeViolations}件
                                  </span>
                                  {d.timeViolations > 0 && d.timeViolationDetails && (
                                    <button
                                      onClick={() => setDetailModal({ type: 'timeViolation', data: d.timeViolationDetails })}
                                      className="block text-xs text-orange-600 hover:underline mt-1"
                                    >
                                      詳細
                                    </button>
                                  )}
                                </>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {isQuarterly ? (
                                <div>
                                  <div className="text-sm font-semibold text-red-600">
                                    {d.totalComplaints}件
                                  </div>
                                  {d.totalComplaints > 0 && (
                                    <button
                                      onClick={() => {
                                        const allDetails = driver.monthly.flatMap(m => m.complaintDetails || []);
                                        setDetailModal({ type: 'complaint', data: allDetails });
                                      }}
                                      className="text-xs text-red-600 hover:underline mt-1"
                                    >
                                      詳細
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <span className={`text-sm font-semibold ${d.complaints > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                    {d.complaints}件
                                  </span>
                                  {d.complaints > 0 && d.complaintDetails && (
                                    <button
                                      onClick={() => setDetailModal({ type: 'complaint', data: d.complaintDetails })}
                                      className="block text-xs text-red-600 hover:underline mt-1"
                                    >
                                      詳細
                                    </button>
                                  )}
                                </>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`text-sm font-semibold ${(isQuarterly ? d.totalAbsences : d.sameDayAbsences) > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                {isQuarterly ? d.totalAbsences : d.sameDayAbsences}日
                              </span>
                            </td>
                            {isQuarterly && (
                              <td className="px-4 py-4 text-center">
                                {d.accidents > 0 ? (
                                  <div>
                                    <div className="text-sm font-semibold text-red-700">
                                      {d.accidents}件
                                    </div>
                                    <button
                                      onClick={() => setDetailModal({ type: 'accident', data: d.accidentDetails })}
                                      className="text-xs text-red-600 hover:underline mt-1"
                                    >
                                      詳細
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">なし</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DriverDetailModal = () => {
    if (!selectedDriver) return null;

    const q = selectedDriver.quarterly;
    const totalDeliveries = q.totalRegular + q.totalPosting;

    return (
      <div
        onClick={() => setSelectedDriver(null)}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-t-2xl text-white relative">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-30"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-bold mb-2">{selectedDriver.name}</h2>
            <div className="text-blue-100">
              {selectedDriver.id} | {selectedDriver.region} {selectedDriver.area}
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-sm text-gray-600 mb-2">四半期評価</div>
                <div className="text-3xl font-bold" style={{ color: getScoreColor(q.avgScore) }}>
                  ★ {q.avgScore}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <div className="text-sm text-gray-600 mb-2">総配達数</div>
                <div className="text-3xl font-bold text-green-700">
                  {totalDeliveries.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">個</div>
              </div>

              <div className="bg-orange-50 rounded-xl p-6">
                <div className="text-sm text-gray-600 mb-2">クレーム</div>
                <div className="text-3xl font-bold text-orange-600">
                  {q.totalComplaints}
                </div>
                <div className="text-xs text-gray-600 mt-1">件</div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <div className="text-sm text-gray-600 mb-2">稼働日数</div>
                <div className="text-3xl font-bold text-purple-700">
                  {q.totalWorkDays}
                </div>
                <div className="text-xs text-gray-600 mt-1">日</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">📦 配達内訳（四半期）</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">一般荷物</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {q.totalRegular.toLocaleString()}個
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">ポスティング</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {q.totalPosting.toLocaleString()}個
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">📊 月次推移</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">月</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">評価</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">配達数</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">クレーム</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDriver.monthly.map((m, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">
                            {m.month}月
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-lg font-bold" style={{ color: getScoreColor(m.score) }}>
                              ★ {m.score}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            {(m.regularCompleted + m.postingCompleted).toLocaleString()}個
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-semibold ${m.complaints > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                              {m.complaints}件
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DetailInfoModal = () => {
    if (!detailModal) return null;

    const { type, data } = detailModal;

    const getTitle = () => {
      if (type === 'timeViolation') return '⏰ 時間不履行 詳細';
      if (type === 'complaint') return '⚠️ クレーム 詳細';
      if (type === 'accident') return '🚨 事故 詳細';
      return '';
    };

    const getColor = () => {
      if (type === 'timeViolation') return '#ed6c02';
      if (type === 'complaint') return '#d32f2f';
      if (type === 'accident') return '#d32f2f';
      return '#666';
    };

    return (
      <div
        onClick={() => setDetailModal(null)}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        >
          <div className="p-6 rounded-t-2xl text-white relative" style={{ background: getColor() }}>
            <button
              onClick={() => setDetailModal(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 rounded-full w-9 h-9 flex items-center justify-center hover:bg-opacity-30"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold">
              {getTitle()}
            </h3>
          </div>

          <div className="p-6">
            {type === 'timeViolation' && data && data.length > 0 && (
              <div className="space-y-4">
                {data.map((item, index) => (
                  <div key={index} className="bg-orange-50 border-2 border-orange-300 rounded-lg p-5">
                    <div className="text-sm text-orange-800 font-semibold mb-3">
                      📅 {item.date}
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">時間帯: </span>
                      <span className="text-base font-semibold">{item.timeSlot}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">理由: </span>
                      <span className="text-base">{item.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {type === 'complaint' && data && data.length > 0 && (
              <div className="space-y-4">
                {data.map((item, index) => (
                  <div key={index} className="bg-red-50 border-2 border-red-300 rounded-lg p-5">
                    <div className="text-sm text-red-800 font-semibold mb-3">
                      📅 {item.date}
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">種類: </span>
                      <span className="text-base font-semibold">{item.type}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">詳細: </span>
                      <span className="text-base">{item.detail}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">状況: </span>
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${
                        item.status === '対応済み' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {type === 'accident' && data && data.length > 0 && (
              <div className="space-y-4">
                {data.map((item, index) => (
                  <div key={index} className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
                    <div className="text-base text-red-800 font-bold mb-4">
                      📅 {item.date}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">種類</div>
                        <div className="text-lg font-semibold">{item.type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">状況</div>
                        <div className="text-base">{item.situation}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">損害</div>
                        <div className="text-base">{item.damage}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">対応状況</div>
                        <div className="inline-block text-sm font-semibold bg-green-100 text-green-700 px-3 py-2 rounded">
                          {item.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!data || data.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                詳細情報がありません
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!selectedRegion && <RegionSelection />}
      {selectedRegion && !selectedArea && <AreaSelection />}
      {selectedRegion && selectedArea && <DriverList />}
      <DriverDetailModal />
      <DetailInfoModal />
    </div>
  );
};

export default RegionalDashboard;
