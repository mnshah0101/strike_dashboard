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
} from "@/components/ui/pagination"

// API functions
const fetchBets = async () => {
  const token = getBearerToken();
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
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch bets");
  }
  
  return res.json();
};

const createBet = async (data) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets`,
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
    throw new Error(error.message || "Failed to create bet");
  }

  return res.json();
};

const updateBet = async ({ id, data }) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets/${id}`,
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
    throw new Error(error.message || "Failed to update bet");
  }

  return res.json();
};

const deleteBet = async (id) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets/${id}`,
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
    throw new Error(error.message || "Failed to delete bet");
  }

  return res.json();
};

export default function BetCrudPanel() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBetId, setSelectedBetId] = useState(null);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust this number as needed

  // Add resetForm function
  const resetForm = () => {
    setSelectedBetId(null);
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
  };

  // Add handleEdit function
  const handleEdit = (bet) => {
    setSelectedBetId(bet.bet_id);
    setFormData({
      line_id: bet.line_id,
      user_id: bet.user_id,
      multiplier: bet.multiplier.toString(),
      potential_payout: bet.potential_payout.toString(),
      potential_loss: bet.potential_loss.toString(),
      bet_side: bet.bet_side,
      final_stat: bet.final_stat.toString(),
      active: bet.active,
      details: JSON.stringify(bet.details, null, 2),
    });
    setIsDialogOpen(true);
  };

  // Add handleDelete function
  const handleDelete = (betId) => {
    deleteMutation.mutate(betId);
  };

  // Queries
  const { data: bets, isLoading } = useQuery({
    queryKey: ["bets"],
    queryFn: fetchBets,
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createBet,
    onSuccess: () => {
      queryClient.invalidateQueries(["bets"]);
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBet,
    onSuccess: () => {
      queryClient.invalidateQueries(["bets"]);
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBet,
    onSuccess: () => {
      queryClient.invalidateQueries(["bets"]);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  // Rest of the component remains mostly the same, but with updated handlers
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      let parsedDetails = JSON.parse(formData.details || "{}");
      
      const data = {
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

      if (selectedBetId) {
        updateMutation.mutate({ id: selectedBetId, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (err) {
      setError(new Error("Invalid JSON format in Details field"));
      setErrorModalOpen(true);
    }
  };

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBets = bets ? bets.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = bets ? Math.ceil(bets.length / itemsPerPage) : 0;

  // Add pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // The rest of your component JSX remains the same, just add the ErrorModal:
  return (
    <>
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
            <>
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
                    {currentBets.map((bet) => (
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
