"use client";

import React, { useState } from "react";

export default function StatTypeTable({ lines }) {
  const [filter, setFilter] = useState("");

  // Filter lines by matching stat_type
  const filteredLines = lines.filter((line) =>
    line.stat_type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <section>
      <h2>Filter by Stat Type</h2>
      <input
        type="text"
        placeholder="e.g. points, assists..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Stat Type</th>
            <th>Line Value</th>
          </tr>
        </thead>
        <tbody>
          {filteredLines.map((line) => (
            <tr key={line.line_id}>
              <td>{line.player_name}</td>
              <td>{line.stat_type}</td>
              <td>{line.line_value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
