"use client";

import React from "react";

export default function PlayerStatsTable({ lines }) {
  return (
    <section>
      <h2>Player Stats Overview</h2>
      <table>
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Stat Type</th>
            <th>Line Value</th>
            <th>Projection</th>
            <th>Total Volume</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.line_id}>
              <td>{line.player_name}</td>
              <td>{line.stat_type}</td>
              <td>{line.line_value}</td>
              {/* 
                If line.projection is an object, you could do something like:
                JSON.stringify(line.projection) or line.projection.value
              */}
              <td>{JSON.stringify(line.projection)}</td>
              <td>{line.total_volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
