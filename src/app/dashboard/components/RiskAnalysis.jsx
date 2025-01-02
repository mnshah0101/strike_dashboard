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

  useEffect(() => {
    if (lineStats?.current_line) {
      const selectedLine = selectedHistoryIndex === -1 
        ? lineStats.current_line 
        : lineStats.line_history[selectedHistoryIndex];
      
      calculateProfitLoss(selectedLine);
      calculateNormalDistribution(selectedLine);
      calculateExpectedValue(selectedLine);
    }

    if (lineStats?.line_history?.length > 0) {
      calculateLineHistory();
    }
  }, [premium, lineStats, standardDev, selectedHistoryIndex]);

  const calculateProfitLoss = (selectedLine) => {
    if (!selectedLine) return;

    const data = [];
    const currentValue = Number(selectedLine.line_value) || 0;
    const range = 10;

    const totalOverVolume = lineStats.line_history.reduce((sum, line) => 
      sum + (Number(line.total_over_volume) || 0), 0) + (Number(lineStats.current_line.total_over_volume) || 0);
    const totalUnderVolume = lineStats.line_history.reduce((sum, line) => 
      sum + (Number(line.total_under_volume) || 0), 0) + (Number(lineStats.current_line.total_under_volume) || 0);

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