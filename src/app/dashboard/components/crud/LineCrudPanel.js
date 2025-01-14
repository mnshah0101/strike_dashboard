import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
const fetchLines = async () => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch lines");
  }
  
  return res.json();
};

const createLine = async (data) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines`,
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
    throw new Error(error.message || "Failed to create line");
  }

  return res.json();
};

const updateLine = async ({ id, data }) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines/${id}`,
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
    throw new Error(error.message || "Failed to update line");
  }

  return res.json();
};

const deleteLine = async (lineId) => {
  const token = getBearerToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines/${lineId}`,
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
    throw new Error(error.message || "Failed to delete line");
  }

  return res.json();
};

export default function LineCrudPanel() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [formData, setFormData] = useState({
    line_value: "",
    betting_event_id: "",
    is_most_recent: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const resetForm = () => {
    setSelectedLineId(null);
    setFormData({
      line_value: "",
      betting_event_id: "",
      is_most_recent: false,
    });
  };

  const handleEdit = (line) => {
    setSelectedLineId(line.line_id);
    setFormData({
      line_value: line.line_value.toString(),
      betting_event_id: line.betting_event_id,
      is_most_recent: line.is_most_recent,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (lineId) => {
    deleteMutation.mutate(lineId);
  };

  // Queries
  const { data: lines, isLoading } = useQuery({
    queryKey: ["lines"],
    queryFn: fetchLines,
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createLine,
    onSuccess: () => {
      queryClient.invalidateQueries(["lines"]);
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateLine,
    onSuccess: () => {
      queryClient.invalidateQueries(["lines"]);
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLine,
    onSuccess: () => {
      queryClient.invalidateQueries(["lines"]);
    },
    onError: (error) => {
      setError(error);
      setErrorModalOpen(true);
    },
  });

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    const data = {
      line_value: parseFloat(formData.line_value) || 0.0,
      betting_event_id: formData.betting_event_id,
      is_most_recent: !!formData.is_most_recent,
    };

    if (selectedLineId) {
      updateMutation.mutate({ id: selectedLineId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLines = lines ? lines.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = lines ? Math.ceil(lines.length / itemsPerPage) : 0;

  // Add pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Lines Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Line
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedLineId ? "Edit Line" : "Add New Line"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Line Value"
                    type="number"
                    step="any"
                    value={formData.line_value}
                    onChange={(e) =>
                      setFormData({ ...formData, line_value: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Betting Event ID"
                    value={formData.betting_event_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        betting_event_id: e.target.value,
                      })
                    }
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isMostRecent"
                      checked={formData.is_most_recent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_most_recent: e.target.checked,
                        })
                      }
                    />
                    <label htmlFor="isMostRecent">Is Most Recent?</label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {selectedLineId ? "Update" : "Create"}
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
          ) : lines?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No lines found. Create one to get started.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Line ID</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Is Most Recent</TableHead>
                      <TableHead>Betting Event ID</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentLines.map((line) => (
                      <TableRow key={line.line_id}>
                        <TableCell>{line.line_id}</TableCell>
                        <TableCell>{line.line_value}</TableCell>
                        <TableCell>{line.is_most_recent ? "Yes" : "No"}</TableCell>
                        <TableCell>{line.betting_event_id}</TableCell>
                        <TableCell>{line.created_at}</TableCell>
                        <TableCell>{line.updated_at}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(line)}
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
                                  <AlertDialogTitle>Delete Line</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this line? This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(line.line_id)}
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
