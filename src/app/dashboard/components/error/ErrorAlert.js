import { AlertCircle } from "lucide-react";

export function ErrorAlert({ message }) {
  return (
    <div className="flex items-center gap-2 p-4 mb-4 text-red-800 bg-red-100 rounded-lg">
      <AlertCircle className="h-5 w-5" />
      <p>{message}</p>
    </div>
  );
}
