"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorAlert } from "../error/ErrorAlert";
import ErrorModal from "@/components/modals/ErrorModal";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2, Plus } from "lucide-react";
import { getBearerToken } from "@/utils/auth";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// API functions
const fetchEvents = async () => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/betting-events`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch betting events");
  }
  
  return res.json();
};

const createEvent = async (data) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/betting-events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create betting event");
  }

  return res.json();
};

const updateEvent = async ({ id, data }) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/betting-events/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update betting event");
  }

  return res.json();
};

const deleteEvent = async (eventId) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/betting-events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete betting event");
  }

  return res.json();
};

export default function BettingEventCrudPanel() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const resetForm = () => {
    setSelectedEventId(null);
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
  };

  const handleEdit = (event) => {
    setSelectedEventId(event.event_id);
    setFormData({
      player_id: event.player_id || "",
      player_name: event.player_name || "",
      stat_type: event.stat_type || "",
      league: event.league?.toString() || "",
      premium: event.premium?.toString() || "",
      result: event.result || "",
      is_closed: !!event.is_closed,
      event_date: event.event_date || "",
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      in_progress: !!event.in_progress,
      is_complete: !!event.is_complete,
      metadata: JSON.stringify(event.metadata || {}, null, 2),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (eventId) => {
    deleteMutation.mutate(eventId);
  };

  // Queries
  const { data: events, isLoading } = useQuery({
    queryKey: ["betting-events"],
    queryFn: fetchEvents,
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(["betting-events"]);
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(["betting-events"]);
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(["betting-events"]);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      let parsedMetadata = JSON.parse(formData.metadata || "{}");

      const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString();
      };

      const data = {
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

      if (selectedEventId) {
        updateMutation.mutate({ id: selectedEventId, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (err) {
      setError(new Error("Invalid JSON format in metadata"));
      setErrorModalOpen(true);
    }
  };

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = events ? events.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = events ? Math.ceil(events.length / itemsPerPage) : 0;

  // Add pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
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
                <DialogTitle>
                  {selectedEventId ? "Edit Betting Event" : "Add New Event"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div className="grid gap-4 py-4 md:grid-cols-2">
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
                  <Input
                    placeholder="Stat Type"
                    value={formData.stat_type}
                    onChange={(e) =>
                      setFormData({ ...formData, stat_type: e.target.value })
                    }
                  />
                  <Input
                    placeholder="League (Number)"
                    type="number"
                    value={formData.league}
                    onChange={(e) =>
                      setFormData({ ...formData, league: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Premium (Number)"
                    type="number"
                    step="any"
                    value={formData.premium}
                    onChange={(e) =>
                      setFormData({ ...formData, premium: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Result"
                    value={formData.result}
                    onChange={(e) =>
                      setFormData({ ...formData, result: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Event Date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Start Time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                  />
                  <Input
                    placeholder="End Time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_closed"
                      checked={formData.is_closed}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_closed: checked })
                      }
                    />
                    <Label htmlFor="is_closed">Is Closed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="in_progress"
                      checked={formData.in_progress}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, in_progress: checked })
                      }
                    />
                    <Label htmlFor="in_progress">In Progress</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_complete"
                      checked={formData.is_complete}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_complete: checked })
                      }
                    />
                    <Label htmlFor="is_complete">Is Complete</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metadata">Metadata (JSON)</Label>
                  <textarea
                    id="metadata"
                    className="w-full rounded-md border p-2 text-sm"
                    rows={6}
                    value={formData.metadata}
                    onChange={(e) =>
                      setFormData({ ...formData, metadata: e.target.value })
                    }
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">
                    {selectedEventId ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
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
          ) : !events || events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No betting events found. Create one to get started.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event ID</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Stat Type</TableHead>
                      <TableHead>League</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEvents.map((event) => (
                      <TableRow key={event.event_id}>
                        <TableCell>{event.event_id}</TableCell>
                        <TableCell>{event.player_name}</TableCell>
                        <TableCell>{event.stat_type}</TableCell>
                        <TableCell>{event.league}</TableCell>
                        <TableCell>${event.premium}</TableCell>
                        <TableCell>
                          {event.is_complete
                            ? "Complete"
                            : event.in_progress
                            ? "In Progress"
                            : event.is_closed
                            ? "Closed"
                            : "Open"}
                        </TableCell>
                        <TableCell>
                          {event.event_date
                            ? new Date(event.event_date).toLocaleString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(event.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(event)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
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
                                    onClick={() => handleDelete(event.event_id)}
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
            </>
          )}
        </CardContent>
      </Card>
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        error={error}
      />
    </>
  );
}
