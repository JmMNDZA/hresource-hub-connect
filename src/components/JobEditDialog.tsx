
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface JobEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobUpdated: () => Promise<void>;
  jobcode: string;
  initialJobdesc: string;
}

const JobEditDialog: React.FC<JobEditDialogProps> = ({
  open,
  onOpenChange,
  onJobUpdated,
  jobcode,
  initialJobdesc,
}) => {
  const [jobdesc, setJobdesc] = useState(initialJobdesc);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    jobdesc: "",
  });

  useEffect(() => {
    if (open) {
      setJobdesc(initialJobdesc);
      setErrors({ jobdesc: "" });
    }
  }, [open, initialJobdesc]);

  const validateForm = () => {
    const newErrors = {
      jobdesc: "",
    };

    let isValid = true;

    if (!jobdesc.trim()) {
      newErrors.jobdesc = "Job description is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("job")
        .update({ jobdesc })
        .eq("jobcode", jobcode);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Job updated successfully",
      });
      
      onJobUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error updating job",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error updating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update the job description for {jobcode}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jobcode" className="text-right">
                Job Code
              </Label>
              <Input
                id="jobcode"
                value={jobcode}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jobdesc" className="text-right">
                Job Description
              </Label>
              <div className="col-span-3">
                <Input
                  id="jobdesc"
                  value={jobdesc}
                  onChange={(e) => setJobdesc(e.target.value)}
                />
                {errors.jobdesc && (
                  <p className="text-sm text-destructive mt-1">{errors.jobdesc}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobEditDialog;
