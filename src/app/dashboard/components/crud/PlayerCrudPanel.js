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

export default function PlayerCrudPanel() {
  const [players, setPlayers] = useState([]);
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
    player_attributes: "",
    relationships: "",
  });
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/players`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setPlayers(data);
    } catch (error) {
      console.error("Failed to fetch players:", error);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const url = selectedPlayerId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/players/${selectedPlayerId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/players`;

      const res = await fetch(url, {
        method: selectedPlayerId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
        },
        body: JSON.stringify(formData),
      });

      await res.json();
      await fetchPlayers();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create/update player:", error);
    }
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

  const handleDelete = async (playerId) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/players/${playerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
          },
          credentials: "include",
        }
      );
      await fetchPlayers();
    } catch (error) {
      console.error("Failed to delete player:", error);
    }
  };

  const resetForm = () => {
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
      player_attributes: "",
      relationships: "",
    });
    setSelectedPlayerId(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
                <div className="flex items-center gap-2">
                  <label htmlFor="is_combo">Is Combo:</label>
                  <input
                    type="checkbox"
                    id="is_combo"
                    checked={formData.is_combo}
                    onChange={(e) =>
                      setFormData({ ...formData, is_combo: e.target.checked })
                    }
                  />
                </div>
                <Input
                  placeholder="Player Attributes (JSON)"
                  value={formData.player_attributes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      player_attributes: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Relationships (JSON)"
                  value={formData.relationships}
                  onChange={(e) =>
                    setFormData({ ...formData, relationships: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedPlayerId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players && players.length > 0 && players.map((p) => (
                <TableRow key={p.player_id}>
                  <TableCell>{p.player_id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.position}</TableCell>
                  <TableCell>{p.team}</TableCell>
                  <TableCell>{p.team_name}</TableCell>
                  <TableCell>{p.opposing_team_abv}</TableCell>
                  <TableCell>{p.league_id}</TableCell>
                  <TableCell>
                    <img src={p.image_url} alt={p.name} className="h-8 w-8" />
                  </TableCell>
                  <TableCell>{p.is_combo ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(p)}
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
                              Are you sure you want to delete {p.name}? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(p.player_id)}
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
      </CardContent>
    </Card>
  );
}
