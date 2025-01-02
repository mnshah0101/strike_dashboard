"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RiskAnalysisChart({ lineStats }) {
  const [premium, setPremium] = useState(0);
  const [standardDev, setStandardDev] = useState(2);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1);
  const [profitLossData, setProfitLossData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [expectedValueData, setExpectedValueData] = useState([]);
  const [lineHistoryData, setLineHistoryData] = useState([]);
  const [useHypothetical, setUseHypothetical] = useState(false);
  const [hypotheticalOver, setHypotheticalOver] = useState(0);
  const [hypotheticalUnder, setHypotheticalUnder] = useState(0);
  const [warnings, setWarnings] = useState({
    maxLoss: 0,
    imbalanceRatio: 0,
    shouldAdjustLine: false,
    suggestedAdjustment: 0
  });

  useEffect(() => {
    if (lineStats?.current_line) {
      const selectedLine = selectedHistoryIndex === -1 
        ? lineStats.current_line 
        : lineStats.line_history[selectedHistoryIndex];
      
      calculateProfitLoss(selectedLine);
      calculateNormalDistribution(selectedLine);
      calculateExpectedValue(selectedLine);
      calculateWarnings(selectedLine);
    }

    if (lineStats?.line_history?.length > 0) {
      calculateLineHistory();
    }
  }, [premium, lineStats, standardDev, selectedHistoryIndex, useHypothetical, hypotheticalOver, hypotheticalUnder]);

  useEffect(() => {
    if (useHypothetical && lineStats?.current_line) {
      const totalOver = lineStats.line_history.reduce((sum, line) => 
        sum + (Number(line.total_over_volume) || 0), 0) + (Number(lineStats.current_line.total_over_volume) || 0);
      const totalUnder = lineStats.line_history.reduce((sum, line) => 
        sum + (Number(line.total_under_volume) || 0), 0) + (Number(lineStats.current_line.total_under_volume) || 0);
      
      setHypotheticalOver(totalOver);
      setHypotheticalUnder(totalUnder);
    }
  }, [useHypothetical, lineStats]);

  const calculateProfitLoss = (selectedLine) => {
    if (!selectedLine) return;

    const data = [];
    const currentValue = Number(selectedLine.line_value) || 0;
    const range = 10;

    let totalOverVolume, totalUnderVolume;
    
    if (useHypothetical) {
      totalOverVolume = hypotheticalOver;
      totalUnderVolume = hypotheticalUnder;
    } else {
      totalOverVolume = lineStats.line_history.reduce((sum, line) => 
        sum + (Number(line.total_over_volume) || 0), 0) + (Number(lineStats.current_line.total_over_volume) || 0);
      totalUnderVolume = lineStats.line_history.reduce((sum, line) => 
        sum + (Number(line.total_under_volume) || 0), 0) + (Number(lineStats.current_line.total_under_volume) || 0);
    }

    for (let i = -range; i <= range; i++) {
      const outcome = currentValue + i;
      const overProfit = calculateProfit("over", outcome);
      const underProfit = calculateProfit("under", outcome);
      const totalPremium =
        (Number(selectedLine.over_bet_count) +
          Number(selectedLine.under_bet_count)) *
        premium;

      data.push({
        outcome: outcome.toFixed(2),
        overProfit: Number(overProfit.toFixed(2)),
        underProfit: Number(underProfit.toFixed(2)),
        netExposure: Number((overProfit + underProfit + totalPremium).toFixed(2)),
        premium: totalPremium
      });
    }
    setProfitLossData(data);
  };

  const calculateNormalDistribution = (selectedLine) => {
    if (!selectedLine) return;

    const mean = Number(selectedLine.line_value);
    const data = [];
    const range = 10;

    for (let i = -range; i <= range; i += 0.5) {
      const x = mean + i;
      const y =
        (1 / (standardDev * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((x - mean) / standardDev, 2));

      data.push({
        outcome: x.toFixed(2),
        probability: y,
        lineValue: mean
      });
    }
    setDistributionData(data);
  };

  const calculateExpectedValue = (selectedLine) => {
    if (!selectedLine) return;

    const mean = Number(selectedLine.line_value);
    const data = [];
    const range = 10;

    for (let i = -range; i <= range; i += 0.5) {
      const outcome = mean + i;
      const probability =
        (1 / (standardDev * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((outcome - mean) / standardDev, 2));

      const overProfit = calculateProfit("over", outcome);
      const underProfit = calculateProfit("under", outcome);
      const totalPremium =
        (Number(selectedLine.over_bet_count) +
          Number(selectedLine.under_bet_count)) *
        premium;
      const totalPL = overProfit + underProfit + totalPremium;

      data.push({
        outcome: outcome.toFixed(2),
        expectedValue: Number((totalPL * probability).toFixed(2)),
        probability: probability,
        profitLoss: totalPL
      });
    }
    setExpectedValueData(data);
  };

  const calculateLineHistory = () => {
    const historyData = lineStats.line_history.map((history) => {
      const mean = Number(history.line_value);
      const standardDev = 2;
      const range = 10;
      const data = [];

      for (let i = -range; i <= range; i += 0.5) {
        const x = mean + i;
        const y =
          (1 / (standardDev * Math.sqrt(2 * Math.PI))) *
          Math.exp(-0.5 * Math.pow((x - mean) / standardDev, 2));

        data.push({
          outcome: x.toFixed(2),
          probability: y,
          lineValue: mean
        });
      }
      return { history, data };
    });

    setLineHistoryData(historyData);
  };

  const calculateProfit = (side, outcome) => {
    const stats = lineStats?.current_line;
    if (!stats) return 0;

    const lineValue = Number(stats.line_value) || 0;
    const overVolume = Number(stats.total_over_volume) || 0;
    const underVolume = Number(stats.total_under_volume) || 0;

    if (side === "over") {
      return outcome > lineValue ? -overVolume : overVolume;
    } else {
      return outcome < lineValue ? -underVolume : underVolume;
    }
  };

  const calculateWarnings = (selectedLine) => {
    if (!selectedLine) return;

    const currentValue = Number(selectedLine.line_value) || 0;
    let overVolume, underVolume;
    
    if (useHypothetical) {
      overVolume = hypotheticalOver;
      underVolume = hypotheticalUnder;
    } else {
      overVolume = lineStats.line_history.reduce((sum, line) => 
        sum + (Number(line.total_over_volume) || 0), 0) + (Number(lineStats.current_line.total_over_volume) || 0);
      underVolume = lineStats.line_history.reduce((sum, line) => 
        sum + (Number(line.total_under_volume) || 0), 0) + (Number(lineStats.current_line.total_under_volume) || 0);
    }

    const maxLoss = Math.max(overVolume, underVolume);
    
    const imbalanceRatio = Math.max(overVolume, underVolume) / Math.min(overVolume, underVolume);
    
    const shouldAdjustLine = imbalanceRatio > 1.5;
    
    let suggestedAdjustment = 0;
    if (shouldAdjustLine) {
      const dominantSide = overVolume > underVolume ? 'over' : 'under';
      suggestedAdjustment = dominantSide === 'over' ? 0.5 : -0.5;
    }

    setWarnings({
      maxLoss,
      imbalanceRatio,
      shouldAdjustLine,
      suggestedAdjustment
    });
  };

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle>Risk Analysis Simulator</CardTitle>
        <CardDescription>
          Analyze potential outcomes, profit/loss scenarios, and expected value
        </CardDescription>
        <div className="mt-2 text-sm text-gray-600">Selected Line ID: {lineStats?.line_id || "N/A"}</div>
      </CardHeader>
      <CardContent>
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">How to Read These Charts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold">P/L Scenarios</h4>
              <ul className="list-disc pl-4">
                <li>Purple: Over position P/L</li>
                <li>Green: Under position P/L</li>
                <li>Orange: Net exposure (incl. premium)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Probability Distribution</h4>
              <ul className="list-disc pl-4">
                <li>Blue area: Normal distribution</li>
                <li>Red line: Current line value</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Expected Value</h4>
              <ul className="list-disc pl-4">
                <li>Bars: P/L weighted by probability</li>
                <li>Height indicates likely profitability</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <div>
            <Label htmlFor="premium">Premium per Bet ($)</Label>
            <Input
              id="premium"
              type="number"
              step="0.1"
              value={premium.toString()}
              onChange={(e) => setPremium(parseFloat(e.target.value) || 0)}
              className="w-48"
            />
          </div>
          <div>
            <Label htmlFor="standardDev">Standard Deviation</Label>
            <Input
              id="standardDev"
              type="number"
              step="0.1"
              value={standardDev.toString()}
              onChange={(e) => setStandardDev(parseFloat(e.target.value) || 2)}
              className="w-48"
            />
          </div>
          <div>
            <Label htmlFor="lineSelect">Select Line</Label>
            <select
              id="lineSelect"
              value={selectedHistoryIndex}
              onChange={(e) => setSelectedHistoryIndex(Number(e.target.value))}
              className="w-48 h-10 px-3 py-2 rounded-md border border-input"
            >
              <option value={-1}>Current Line</option>
              {lineStats?.line_history?.map((history, index) => (
                <option key={index} value={index}>
                  Historical Line: {history.line_value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="useHypothetical"
              checked={useHypothetical}
              onChange={(e) => setUseHypothetical(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="useHypothetical">Use Hypothetical Volumes</Label>
          </div>
          
          {useHypothetical && (
            <div className="flex gap-4">
              <div>
                <Label htmlFor="hypotheticalOver">Hypothetical Over Volume ($)</Label>
                <Input
                  id="hypotheticalOver"
                  type="number"
                  value={hypotheticalOver}
                  onChange={(e) => setHypotheticalOver(Number(e.target.value) || 0)}
                  className="w-48"
                />
              </div>
              <div>
                <Label htmlFor="hypotheticalUnder">Hypothetical Under Volume ($)</Label>
                <Input
                  id="hypotheticalUnder"
                  type="number"
                  value={hypotheticalUnder}
                  onChange={(e) => setHypotheticalUnder(Number(e.target.value) || 0)}
                  className="w-48"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Risk Warnings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Maximum Potential Loss:</span>
                <span className={`${warnings.maxLoss > 10000 ? 'text-red-600 font-bold' : ''}`}>
                  ${warnings.maxLoss.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Volume Imbalance Ratio:</span>
                <span className={`${warnings.imbalanceRatio > 1.5 ? 'text-red-600 font-bold' : ''}`}>
                  {warnings.imbalanceRatio.toFixed(2)}
                </span>
              </div>
            </div>
            
            {warnings.shouldAdjustLine && (
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Suggested Line Adjustment</span>
                </div>
                <p className="mt-1">
                  Consider moving the line {warnings.suggestedAdjustment > 0 ? 'up' : 'down'} by{' '}
                  {Math.abs(warnings.suggestedAdjustment)} points to balance exposure.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="h-[300px]">
            <h3 className="font-semibold mb-2">Profit/Loss Scenarios</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitLossData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="outcome" label={{ value: "Outcome", position: "bottom" }} />
                <YAxis label={{ value: "P/L ($)", angle: -90, position: "left" }} />
                <Tooltip formatter={(value) => [`$${value}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="overProfit" stroke="#8884d8" name="Over P/L" dot={false} />
                <Line type="monotone" dataKey="underProfit" stroke="#82ca9d" name="Under P/L" dot={false} />
                <Line type="monotone" dataKey="netExposure" stroke="#ff7300" name="Net P/L" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[300px]">
            <h3 className="font-semibold mb-2">Outcome Probability Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="outcome" label={{ value: "Outcome", position: "bottom" }} />
                <YAxis label={{ value: "Probability", angle: -90, position: "left" }} />
                <Tooltip />
                <Area type="monotone" dataKey="probability" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                <Line type="monotone" dataKey="lineValue" stroke="#ff0000" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[300px]">
            <h3 className="font-semibold mb-2">Expected Value by Outcome</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expectedValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="outcome" label={{ value: "Outcome", position: "bottom" }} />
                <YAxis label={{ value: "Expected Value ($)", angle: -90, position: "left" }} />
                <Tooltip
                  formatter={(value, name) => [
                    `$${value}`,
                    name === "expectedValue" ? "Expected Value" : name
                  ]}
                />
                <Bar dataKey="expectedValue" fill="#82ca9d" name="Expected Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

       
      </CardContent>
    </Card>
  );
}