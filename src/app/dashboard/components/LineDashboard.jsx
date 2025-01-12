"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorAlert } from "./error/ErrorAlert";
import RiskAnalysisChart from "./RiskAnalysis";
import { getBearerToken } from "@/utils/auth";
import { handleApiError } from "@/utils/auth";
export default function LineStatsDashboard() {
  const [lineStats, setLineStats] = useState({});
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState(null);

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    const token = getBearerToken();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setLines(data);

      // Fetch stats for each line
      const statsPromises = data.map((line) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines/${line.line_id}/stats`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
            },
          }
        ).then((res) => res.json())
      );

      const stats = await Promise.all(statsPromises);
      const statsMap = {};
      stats.forEach((stat, index) => {
        statsMap[data[index].line_id] = stat;
      });

      setLineStats(statsMap);
    } catch (error) {
      handleApiError(error);
      console.error("Failed to fetch line data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (lineId) => {
    console.log("Selected Line ID:", lineId);
    console.log("Line Stats:", lineStats[lineId]);
    setSelectedLine(lineId);
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Line Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <ErrorAlert message={error} />}

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Betting Event ID</TableHead>
                    <TableHead>Line Value</TableHead>
                    <TableHead>Total Over Volume</TableHead>
                    <TableHead>Total Under Volume</TableHead>
                    <TableHead>Over Bet Count</TableHead>
                    <TableHead>Under Bet Count</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line) => {
                    const stats = lineStats[line.line_id]?.current_line;
                    return (
                      <TableRow
                        key={line.line_id}
                        onClick={() => handleRowClick(line.line_id)}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <TableCell>{line.betting_event_id}</TableCell>
                        <TableCell>{line.line_value}</TableCell>
                        <TableCell>${stats?.total_over_volume || 0}</TableCell>
                        <TableCell>${stats?.total_under_volume || 0}</TableCell>
                        <TableCell>{stats?.over_bet_count || 0}</TableCell>
                        <TableCell>{stats?.under_bet_count || 0}</TableCell>
                        <TableCell>
                          {stats?.created_at
                            ? new Date(stats.created_at).toLocaleString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLine && (
        <RiskAnalysisChart lineStats={lineStats[selectedLine]} />
      )}
    </div>
  );
}
