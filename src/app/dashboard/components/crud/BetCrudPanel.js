import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { Edit2, Trash2, Plus } from "lucide-react";

export default function BetCrudPanel() {
  const [bets, setBets] = useState([]);
  const [formData, setFormData] = useState({
    line_id: "",
    multiplier: "",
    potential_payout: "",
    potential_loss: "",
    bet_side: "over",
    active: true,
  });
  const [selectedBetId, setSelectedBetId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
          },
        }
      );
      const data = await res.json();
      setBets(data);
    } catch (error) {
      console.error("Failed to fetch bets:", error);
    }
  };

const handleCreateOrUpdate = async (e) => {
  e.preventDefault();
  try {
    const formattedData = {
      ...formData,
      multiplier: parseFloat(formData.multiplier) || 0,
      potential_payout: parseFloat(formData.potential_payout) || 0,
      potential_loss: parseFloat(formData.potential_loss) || 0,
    };

    const url = selectedBetId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets/${selectedBetId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets`;

    const res = await fetch(url, {
      method: selectedBetId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
      },
      body: JSON.stringify(formattedData),
    });

    await res.json();
    await fetchBets();
    resetForm();
    setIsDialogOpen(false);
  } catch (error) {
    console.error("Failed to create/update bet:", error);
  }
};


  const handleEdit = (bet) => {
    setSelectedBetId(bet.bet_id);
    setFormData({
      line_id: bet.line_id || "",
      multiplier: new Number(bet.multiplier) || 0,
      potential_payout: new Number(bet.potential_payout) || 0,
      potential_loss: new Number(bet.potential_loss) || 0,
      bet_side: bet.bet_side || "over",
      active: bet.active !== undefined ? bet.active : true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (betId) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets/${betId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
        },
      });
      await fetchBets();
    } catch (error) {
      console.error("Failed to delete bet:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      line_id: "",
      multiplier: "",
      potential_payout: "",
      potential_loss: "",
      bet_side: "over",
      active: true,
    });
    setSelectedBetId(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="line_id">Line ID</Label>
                  <Input
                    id="line_id"
                    placeholder="Line ID"
                    value={formData.line_id}
                    onChange={(e) =>
                      setFormData({ ...formData, line_id: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="multiplier">Multiplier</Label>
                  <Input
                    id="multiplier"
                    placeholder="Multiplier"
                    value={formData.multiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        multiplier:
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="potential_payout">Potential Payout</Label>
                  <Input
                    id="potential_payout"
                    placeholder="Potential Payout"
                    value={formData.potential_payout}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        potential_payout:
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="potential_loss">Potential Loss</Label>
                  <Input
                    id="potential_loss"
                    placeholder="Potential Loss"
                    value={formData.potential_loss}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        potential_loss:
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bet_side">Bet Side</Label>
                  <Select
                    value={formData.bet_side}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bet_side: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bet side" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="over">Over</SelectItem>
                      <SelectItem value="under">Under</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedBetId ? "Update" : "Create"}
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
                <TableHead>Bet ID</TableHead>
                <TableHead>Line ID</TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Loss</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map((b) => (
                <TableRow key={b.bet_id}>
                  <TableCell>{b.bet_id}</TableCell>
                  <TableCell>{b.line_id}</TableCell>
                  <TableCell>{b.multiplier}</TableCell>
                  <TableCell>{b.potential_payout}</TableCell>
                  <TableCell>{b.potential_loss}</TableCell>
                  <TableCell className="capitalize">{b.bet_side}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        b.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {b.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(b)}
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
                              onClick={() => handleDelete(b.bet_id)}
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
