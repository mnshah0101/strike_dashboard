import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorAlert } from "../error/ErrorAlert";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit2, Trash2, Plus } from "lucide-react";
import { getBearerToken } from "@/utils/auth";
import { handleApiError } from "@/utils/auth";

export default function BetCrudPanel() {
  const [bets, setBets] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    line_id: "",
    user_id: "",
    multiplier: "",
    potential_payout: "",
    potential_loss: "",
    bet_side: "",
    final_stat: "",
    active: false,
    details: "{}",
  });
  const [selectedBetId, setSelectedBetId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    const token = getBearerToken();
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        handleApiError(errorData);
        throw new Error(errorData.message || "Failed to fetch bets");
      }

      const data = await res.json();

      

      if (!Array.isArray(data)) {
        handleApiError(data);
        throw new Error("Invalid data format received from server");
      }

      setBets(data);
    } catch (error) {
      console.error("Failed to fetch bets:", error);
      handleApiError(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      line_id: "",
      user_id: "",
      multiplier: "",
      potential_payout: "",
      potential_loss: "",
      bet_side: "",
      final_stat: "",
      active: false,
      details: "{}",
    });
    setSelectedBetId(null);
  };

  const handleEdit = (bet) => {
    setSelectedBetId(bet.bet_id);
    setFormData({
      line_id: bet.line_id,
      user_id: bet.user_id,
      multiplier: bet.multiplier || "",
      potential_payout: bet.potential_payout || "",
      potential_loss: bet.potential_loss || "",
      bet_side: bet.bet_side || "",
      final_stat: bet.final_stat || "",
      active: bet.active || false,
      details: JSON.stringify(bet.details || {}, null, 2),
    });
    setIsDialogOpen(true);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate required fields
      if (!formData.line_id || !formData.user_id || !formData.bet_side) {
        setError("Line ID, User ID, and Bet Side are required fields.");
        return;
      }

      // Validate JSON for details
      let parsedDetails;
      try {
        parsedDetails = JSON.parse(formData.details || "{}");
      } catch (err) {
        setError("Invalid JSON format in Details field.");
        return;
      }

      const body = {
        line_id: formData.line_id,
        user_id: formData.user_id,
        multiplier: parseFloat(formData.multiplier) || 0.0,
        potential_payout: parseFloat(formData.potential_payout) || 0.0,
        potential_loss: parseFloat(formData.potential_loss) || 0.0,
        bet_side: formData.bet_side,
        final_stat: parseFloat(formData.final_stat) || 0.0,
        active: !!formData.active,
        details: parsedDetails,
      };

      const url = selectedBetId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets/${selectedBetId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets`;

      const token = getBearerToken();

      const response = await fetch(url, {
        method: selectedBetId ? "PUT" : "POST",
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
          errorData.message ||
            `Failed to ${selectedBetId ? "update" : "create"} bet`
        );
      }

      await fetchBets();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create/update bet:", error);
      setError(error.message);
    }
  };

  const handleDelete = async (betId) => {
    try {
      setError(null);

      const token = getBearerToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets/${betId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete bet");
      }

      await fetchBets();
    } catch (error) {
      console.error("Failed to delete bet:", error);
      setError(error.message);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">Bets Management</CardTitle>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Bet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedBetId ? "Edit Bet" : "Add New Bet"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Line ID"
                  value={formData.line_id}
                  onChange={(e) =>
                    setFormData({ ...formData, line_id: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="User ID"
                  value={formData.user_id}
                  onChange={(e) =>
                    setFormData({ ...formData, user_id: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Multiplier"
                  type="number"
                  step="0.01"
                  value={formData.multiplier}
                  onChange={(e) =>
                    setFormData({ ...formData, multiplier: e.target.value })
                  }
                />
                <Input
                  placeholder="Potential Payout"
                  type="number"
                  step="0.01"
                  value={formData.potential_payout}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      potential_payout: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Potential Loss"
                  type="number"
                  step="0.01"
                  value={formData.potential_loss}
                  onChange={(e) =>
                    setFormData({ ...formData, potential_loss: e.target.value })
                  }
                />
                <Input
                  placeholder="Final Stat"
                  type="number"
                  step="0.01"
                  value={formData.final_stat}
                  onChange={(e) =>
                    setFormData({ ...formData, final_stat: e.target.value })
                  }
                />
                <Input
                  placeholder="Bet Side (over/under)"
                  value={formData.bet_side}
                  onChange={(e) =>
                    setFormData({ ...formData, bet_side: e.target.value })
                  }
                  required
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Details (JSON)</Label>
                  <textarea
                    id="details"
                    className="w-full rounded-md border p-2 text-sm"
                    rows={4}
                    value={formData.details}
                    onChange={(e) =>
                      setFormData({ ...formData, details: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {selectedBetId ? "Update" : "Create"}
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
        ) : bets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No bets found. Create one to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bet ID</TableHead>
                  <TableHead>Line ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Potential Payout</TableHead>
                  <TableHead>Potential Loss</TableHead>
                  <TableHead>Final Stat</TableHead>
                  <TableHead>Bet Side</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Placed At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bets.map((bet) => (
                  <TableRow key={bet.bet_id}>
                    <TableCell>{bet.bet_id}</TableCell>
                    <TableCell>{bet.line_id}</TableCell>
                    <TableCell>{bet.user_id}</TableCell>
                    <TableCell>{bet.multiplier.toFixed(2)}</TableCell>
                    <TableCell>${bet.potential_payout.toFixed(2)}</TableCell>
                    <TableCell>${bet.potential_loss.toFixed(2)}</TableCell>
                    <TableCell>{bet.final_stat.toFixed(2)}</TableCell>
                    <TableCell>{bet.bet_side}</TableCell>
                    <TableCell>{bet.active ? "Yes" : "No"}</TableCell>
                    <TableCell>{JSON.stringify(bet.details)}</TableCell>
                    <TableCell>
                      {new Date(bet.placed_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(bet)}
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
                              <AlertDialogTitle>Delete Bet</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this bet? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(bet.bet_id)}
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
