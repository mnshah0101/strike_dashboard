"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Plus } from "lucide-react";
  import { Label } from "@/components/ui/label";
import { ErrorAlert } from "../error/ErrorAlert";
import { getBearerToken } from "@/utils/auth";
/**
 * Example Betting Events Dashboard Component
 */
export default function BettingEventsDashboard() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // We store the form data for creation and editing here.
  const [formData, setFormData] = useState({
    player_id: "",
    player_name: "",
    stat_type: "",
    league: "",
    premium: "",
    result: "",
    is_closed: false,
    event_date: "",
    start_time: "",
    end_time: "",
    in_progress: false,
    is_complete: false,
    metadata: "{}",
  });

  // To keep track of which event is being edited.
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * Fetch the list of betting events on component mount.
   */
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getBearerToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/betting-events`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch betting events");
      }

      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch betting events:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create or Update a betting event
   */
  // ... existing code ...

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      let parsedMetadata;
      try {
        parsedMetadata = JSON.parse(formData.metadata || "{}");
      } catch (err) {
        alert("Invalid JSON for metadata. Please fix and try again.");
        return;
      }

      // Format dates properly
      const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString();
      };

      const body = {
        player_id: formData.player_id || "",
        player_name: formData.player_name || "",
        stat_type: formData.stat_type || "",
        league: parseInt(formData.league) || 0,
        premium: parseFloat(formData.premium) || 0,
        result: formData.result || "",
        is_closed: !!formData.is_closed,
        event_date: formatDate(formData.event_date),
        start_time: formatDate(formData.start_time),
        end_time: formatDate(formData.end_time),
        in_progress: !!formData.in_progress,
        is_complete: !!formData.is_complete,
        metadata: parsedMetadata,
      };

      const url = selectedEventId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/betting-events/${selectedEventId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/betting-events`;

      const method = selectedEventId ? "PUT" : "POST";

      const token = getBearerToken();

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create/update betting event"
        );
      }

      // Refresh the list, reset the form, and close the dialog.
      await fetchEvents();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create/update betting event:", error);
      alert(error.message); // Show error to user
    }
  };

  /**
   * Load an existing event into the form for editing
   */
  const handleEdit = (bettingEvent) => {
    setSelectedEventId(bettingEvent.event_id);
    setFormData({
      player_id: bettingEvent.player_id || "",
      player_name: bettingEvent.player_name || "",
      stat_type: bettingEvent.stat_type || "",
      league: bettingEvent.league?.toString() || "",
      premium: bettingEvent.premium?.toString() || "",
      result: bettingEvent.result || "",
      is_closed: !!bettingEvent.is_closed,
      event_date: bettingEvent.event_date || "",
      start_time: bettingEvent.start_time || "",
      end_time: bettingEvent.end_time || "",
      in_progress: !!bettingEvent.in_progress,
      is_complete: !!bettingEvent.is_complete,
      metadata: JSON.stringify(bettingEvent.metadata || {}, null, 2), // nicely formatted
    });
    setIsDialogOpen(true);
  };

  /**
   * Delete an existing event by ID
   */
  const handleDelete = async (eventId) => {
    try {
      const token = getBearerToken();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/betting-events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchEvents();
    } catch (error) {
      console.error("Failed to delete betting event:", error);
    }
  };

  /**
   * Reset the form to blank values.
   */
  const resetForm = () => {
    setFormData({
      player_id: "",
      player_name: "",
      stat_type: "",
      league: "",
      premium: "",
      result: "",
      is_closed: false,
      event_date: "",
      start_time: "",
      end_time: "",
      in_progress: false,
      is_complete: false,
      metadata: "{}",
    });
    setSelectedEventId(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">
          Betting Events Management
        </CardTitle>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {selectedEventId ? "Edit Betting Event" : "Add New Event"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div className="grid gap-4 py-4 md:grid-cols-2">
                {/* Player ID */}
                <Input
                  placeholder="Player ID"
                  value={formData.player_id}
                  onChange={(e) =>
                    setFormData({ ...formData, player_id: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Player Name"
                  value={formData.player_name}
                  onChange={(e) =>
                    setFormData({ ...formData, player_name: e.target.value })
                  }
                  required
                />

                {/* Stat Type */}
                <Input
                  placeholder="Stat Type"
                  value={formData.stat_type}
                  onChange={(e) =>
                    setFormData({ ...formData, stat_type: e.target.value })
                  }
                />

                {/* League */}
                <Input
                  placeholder="League (Number)"
                  type="number"
                  value={formData.league}
                  onChange={(e) =>
                    setFormData({ ...formData, league: e.target.value })
                  }
                />

                {/* Premium */}
                <Input
                  placeholder="Premium (Number)"
                  type="number"
                  step="any"
                  value={formData.premium}
                  onChange={(e) =>
                    setFormData({ ...formData, premium: e.target.value })
                  }
                />

                {/* Result */}
                <Input
                  placeholder="Result"
                  value={formData.result}
                  onChange={(e) =>
                    setFormData({ ...formData, result: e.target.value })
                  }
                />

                {/* Event Date */}
                <Input
                  placeholder="Event Date (ISO)"
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) =>
                    setFormData({ ...formData, event_date: e.target.value })
                  }
                />
                

                {/* Start Time */}
                <Input
                  placeholder="Start Time (ISO)"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />

                {/* End Time */}
                <Input
                  placeholder="End Time (ISO)"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />

                {/* is_closed */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_closed"
                    checked={formData.is_closed}
                    onChange={(e) =>
                      setFormData({ ...formData, is_closed: e.target.checked })
                    }
                  />
                  <label htmlFor="is_closed">Is Closed?</label>
                </div>

                {/* in_progress */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="in_progress"
                    checked={formData.in_progress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        in_progress: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="in_progress">In Progress?</label>
                </div>

                {/* is_complete */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_complete"
                    checked={formData.is_complete}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_complete: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="is_complete">Is Complete?</label>
                </div>
              </div>

              {/* Metadata (JSON) - large text area */}
              <label className="block text-sm font-semibold" htmlFor="metadata">
                Metadata (JSON)
              </label>
              <textarea
                id="metadata"
                className="w-full rounded-md border p-2 text-sm"
                rows={6}
                value={formData.metadata}
                onChange={(e) =>
                  setFormData({ ...formData, metadata: e.target.value })
                }
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedEventId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {error && <ErrorAlert message={error} />}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No betting events found. Create one to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Stat Type</TableHead>
                  <TableHead>Closed?</TableHead>
                  <TableHead>In Progress?</TableHead>
                  <TableHead>Complete?</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((ev) => (
                  <TableRow key={ev.event_id}>
                    <TableCell>{ev.event_id}</TableCell>
                    <TableCell>{ev.player_name}</TableCell>
                    <TableCell>{ev.stat_type}</TableCell>
                    <TableCell>{ev.is_closed ? "Yes" : "No"}</TableCell>
                    <TableCell>{ev.in_progress ? "Yes" : "No"}</TableCell>
                    <TableCell>{ev.is_complete ? "Yes" : "No"}</TableCell>
                    <TableCell>{ev.created_at}</TableCell>
                    <TableCell>{ev.updated_at}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Edit button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(ev)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        {/* Delete button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Betting Event
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this event? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(ev.event_id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
