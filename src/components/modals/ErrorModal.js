import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorModal({ isOpen, onClose, error }) {
  if (!error) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error Occurred
          </DialogTitle>
          <DialogDescription className="text-red-600">
            {error.message || "An unexpected error occurred"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} variant="destructive">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 