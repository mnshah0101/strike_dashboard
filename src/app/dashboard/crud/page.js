// app/dashboard/crud/page.js
"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PlayerCrudPanel from "../components/crud/PlayerCrudPanel";
import LineCrudPanel from "../components/crud/LineCrudPanel";
import BetCrudPanel from "../components/crud/BetCrudPanel";

export default function CrudDashboardPage() {
  const [activeTab, setActiveTab] = useState("players");

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">CRUD Dashboard</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="lines">Lines</TabsTrigger>
          <TabsTrigger value="bets">Bets</TabsTrigger>
        </TabsList>
        <TabsContent value="players">
          <PlayerCrudPanel />
        </TabsContent>
        <TabsContent value="lines">
          <LineCrudPanel />
        </TabsContent>
        <TabsContent value="bets">
          <BetCrudPanel />
        </TabsContent>
      </Tabs>
    </main>
  );
}
