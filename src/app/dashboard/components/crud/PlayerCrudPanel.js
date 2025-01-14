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
const fetchPlayers = async () => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/players`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch players");
  }
  
  return res.json();
};

const createPlayer = async (data) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/players`,
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
    throw new Error(error.message || "Failed to create player");
  }

  return res.json();
};

const updatePlayer = async ({ id, data }) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/players/${id}`,
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
    throw new Error(error.message || "Failed to update player");
  }

  return res.json();
};

const deletePlayer = async (playerId) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/players/${playerId}`,
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
    throw new Error(error.message || "Failed to delete player");
  }

  return res.json();
};

export default function PlayerCrudPanel() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [formData, setFormData] = useState({
    player_id: "",
    name: "",
    position: "",
    team: "",
    team_name: "",
    opposing_team_abv: "",
    league_id: "",
    image_url: "",
    is_combo: false,
    player_attributes: "{}",
    relationships: "{}",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const resetForm = () => {
    setSelectedPlayerId(null);
    setFormData({
      player_id: "",
      name: "",
      position: "",
      team: "",
      team_name: "",
      opposing_team_abv: "",
      league_id: "",
      image_url: "",
      is_combo: false,
      player_attributes: "{}",
      relationships: "{}",
    });
  };

  const handleEdit = (player) => {
    setSelectedPlayerId(player.player_id);
    setFormData({
      player_id: player.player_id,
      name: player.name,
      position: player.position,
      team: player.team,
      team_name: player.team_name || "",
      opposing_team_abv: player.opposing_team_abv || "",
      league_id: player.league_id || "",
      image_url: player.image_url || "",
      is_combo: player.is_combo || false,
      player_attributes: JSON.stringify(player.player_attributes || {}),
      relationships: JSON.stringify(player.relationships || {}),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (playerId) => {
    deleteMutation.mutate(playerId);
  };

  // Queries
  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries(["players"]);
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries(["players"]);
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries(["players"]);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        player_attributes: JSON.parse(formData.player_attributes),
        relationships: JSON.parse(formData.relationships),
      };

      if (selectedPlayerId) {
        updateMutation.mutate({ id: selectedPlayerId, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (err) {
      setError(new Error("Invalid JSON format in attributes or relationships"));
      setErrorModalOpen(true);
    }
  };

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPlayers = players ? players.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = players ? Math.ceil(players.length / itemsPerPage) : 0;

  // Add pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Players Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedPlayerId ? "Edit Player" : "Add New Player"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Player ID"
                    value={formData.player_id}
                    onChange={(e) =>
                      setFormData({ ...formData, player_id: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Team"
                    value={formData.team}
                    onChange={(e) =>
                      setFormData({ ...formData, team: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Team Name"
                    value={formData.team_name}
                    onChange={(e) =>
                      setFormData({ ...formData, team_name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Opposing Team Abbreviation"
                    value={formData.opposing_team_abv}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opposing_team_abv: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="League ID"
                    value={formData.league_id}
                    onChange={(e) =>
                      setFormData({ ...formData, league_id: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_combo"
                      checked={formData.is_combo}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_combo: checked })
                      }
                    />
                    <Label htmlFor="is_combo">Is Combo</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player_attributes">Player Attributes (JSON)</Label>
                    <textarea
                      id="player_attributes"
                      className="w-full rounded-md border p-2 text-sm"
                      rows={4}
                      value={formData.player_attributes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          player_attributes: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationships">Relationships (JSON)</Label>
                    <textarea
                      id="relationships"
                      className="w-full rounded-md border p-2 text-sm"
                      rows={4}
                      value={formData.relationships}
                      onChange={(e) =>
                        setFormData({ ...formData, relationships: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {selectedPlayerId ? "Update" : "Create"}
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
          ) : !players || players.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No players found. Create one to get started.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Opposing Team</TableHead>
                      <TableHead>League</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Is Combo</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPlayers.map((player) => (
                      <TableRow key={player.player_id}>
                        <TableCell>{player.player_id}</TableCell>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>{player.position}</TableCell>
                        <TableCell>{player.team}</TableCell>
                        <TableCell>{player.team_name}</TableCell>
                        <TableCell>{player.opposing_team_abv}</TableCell>
                        <TableCell>{player.league_id}</TableCell>
                        <TableCell>
                          {player.image_url ? (
                            <img
                              src={player.image_url}
                              alt={player.name}
                              className="h-8 w-8"
                            />
                          ) : (
                            <span className="text-gray-400">No image</span>
                          )}
                        </TableCell>
                        <TableCell>{player.is_combo ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(player)}
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
                                  <AlertDialogTitle>Delete Player</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {player.name}? This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(player.player_id)}
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
