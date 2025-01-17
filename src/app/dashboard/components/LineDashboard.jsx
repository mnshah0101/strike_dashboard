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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ErrorAlert } from "./error/ErrorAlert";
import RiskAnalysisChart from "./RiskAnalysis";
import { getBearerToken } from "@/utils/auth";

export default function LineStatsDashboard() {
  const [lineStats, setLineStats] = useState({});
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLines();
  }, [currentPage]);

  const fetchLines = async () => {
    const token = getBearerToken();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      const linesData = data || [];
      setLines(linesData);
      
      if (linesData.length === 0) {
        setError("No data found");
        setIsLoading(false);
        return;
      }

      // Calculate paginated lines
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentLines = linesData.slice(indexOfFirstItem, indexOfLastItem);

      // Fetch stats for displayed lines only
      const statsPromises = currentLines.map((line) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines/${line.line_id}/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        ).then((res) => res.json())
      );

      const stats = await Promise.all(statsPromises);
      const statsMap = {};
      stats.forEach((stat, index) => {
        statsMap[currentLines[index].line_id] = stat;
      });

      setLineStats(statsMap);
    } catch (error) {
      console.error("Failed to fetch line data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (lineId) => {
    setSelectedLine(lineId);
  };

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedLine(null);
    setLineStats({});
    await fetchLines();
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLines = Array.isArray(lines) ? lines.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = Array.isArray(lines) ? Math.ceil(lines.length / itemsPerPage) : 0;

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
            <>
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
                    {currentLines.map((line) => {
                      const stats = lineStats[line.line_id] || {};
                      return (
                        <TableRow
                          key={line.line_id}
                          onClick={() => handleRowClick(line.line_id)}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          <TableCell>{line.betting_event_id}</TableCell>
                          <TableCell>{line.line_value}</TableCell>
                          <TableCell>${stats?.current_line?.total_over_volume || 0}</TableCell>
                          <TableCell>${stats?.current_line?.total_under_volume || 0}</TableCell>
                          <TableCell>{stats?.current_line?.over_bet_count || 0}</TableCell>
                          <TableCell>{stats?.current_line?.under_bet_count || 0}</TableCell>
                          <TableCell>
                            {stats?.current_line?.created_at
                              ? new Date(stats.current_line.created_at).toLocaleString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 0 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index + 1}>
                          <PaginationLink
                            onClick={() => handlePageChange(index + 1)}
                            isActive={currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedLine && (
        <RiskAnalysisChart lineStats={lineStats[selectedLine]} />
      )}
    </div>
  );
}
