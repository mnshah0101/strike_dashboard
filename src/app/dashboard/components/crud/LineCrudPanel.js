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

export default function LineCrudPanel() {
  const [lines, setLines] = useState([]);
  const [formData, setFormData] = useState({
    line_value: "",
    player_id: "",
    player_name: "",
    stat_type: "",
    premium: "",
    betting_event_id: "",
  });
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
          },
        }
      );
      const data = await res.json();
      setLines(data);
    } catch (error) {
      console.error("Failed to fetch lines:", error);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const url = selectedLineId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines/${selectedLineId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines`;

      const res = await fetch(url, {
        method: selectedLineId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
        },
        body: JSON.stringify(formData),
      });

      await res.json();
      await fetchLines();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create/update line:", error);
    }
  };

  const handleEdit = (line) => {
    setSelectedLineId(line.line_id);
    setFormData({
      line_value: line.line_value || "",
      player_id: line.player_id || "",
      player_name: line.player_name || "",
      stat_type: line.stat_type || "",
      premium: line.premium || "",
      betting_event_id: line.betting_event_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (lineId) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines/${lineId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
          },
        }
      );
      await fetchLines();
    } catch (error) {
      console.error("Failed to delete line:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      line_value: "",
      player_id: "",
      player_name: "",
      stat_type: "",
      premium: "",
      betting_event_id: "",
    });
    setSelectedLineId(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
                  value={formData.line_value}
                  onChange={(e) =>
                    setFormData({ ...formData, line_value: e.target.value })
                  }
                  required
                />
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
                />
                <Input
                  placeholder="Stat Type"
                  value={formData.stat_type}
                  onChange={(e) =>
                    setFormData({ ...formData, stat_type: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Premium"
                  value={formData.premium}
                  onChange={(e) =>
                    setFormData({ ...formData, premium: e.target.value })
                  }
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
                  {selectedLineId ? "Update" : "Create"}
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
                <TableHead>Line ID</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Player ID</TableHead>
                <TableHead>Stat Type</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Betting Event</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((l) => (
                <TableRow key={l.line_id}>
                  <TableCell>{l.line_id}</TableCell>
                  <TableCell>{l.line_value}</TableCell>
                  <TableCell>{l.player_id}</TableCell>
                  <TableCell>{l.stat_type}</TableCell>
                  <TableCell>{l.premium}</TableCell>
                  <TableCell>{l.betting_event_id}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(l)}
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
                              onClick={() => handleDelete(l.line_id)}
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
