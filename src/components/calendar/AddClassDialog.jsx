import { useState } from "react";
import api from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function AddClassDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    batch_id: "",
    faculty_id: "",
    start_time: "",
    end_time: ""
  });

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      // Backend ke schema ke mutabiq data format karein
      // Note: Aapke backend model me batch_id, faculty_id, subject, start_time, end_time chahiye
      const payload = {
        batch_id: Number(formData.batch_id) || 1, // Agar id pass ho rahi hai
        faculty_id: formData.faculty_id ? Number(formData.faculty_id) : null,
        subject: formData.subject,
        start_time: new Date().toISOString(), // Aap apne date/time input ke hisab se set kar sakte hain
        end_time: new Date().toISOString()
      };

      await api.post("/classes", payload);

      toast.success("Class schedule created successfully!");
      setOpen(false);
      setFormData({ subject: "", batch_id: "", faculty_id: "", start_time: "", end_time: "" });
      window.location.reload(); // Page refresh karke schedule update karne ke liye
    } catch (err) {
      console.error(err);
      toast.error("Error creating class. Unauthorized or invalid data.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          + Add Class
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create New Class
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSaveClass} className="space-y-4 mt-2">
          <Input
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />

          <Input
            placeholder="Batch ID"
            value={formData.batch_id}
            onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
            required
          />

          <Input
            placeholder="Faculty ID (Optional)"
            value={formData.faculty_id}
            onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
          />

          <Input
            type="datetime-local"
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            required
          />

          <Button type="submit" className="w-full">
            Save Class
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddClassDialog;