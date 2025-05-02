
import React, { useState } from "react";
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

interface JobAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobAdded: () => Promise<void>;
}

const JobAddDialog: React.FC<JobAddDialogProps> = ({
  open,
  onOpenChange,
  onJobAdded,
}) => {
  const [jobcode, setJobcode] = useState("");
  const [jobdesc, setJobdesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    jobcode: "",
    jobdesc: "",
  });

  const resetForm = () => {
    setJobcode("");
    setJobdesc("");
    setErrors({
      jobcode: "",
      jobdesc: "",
    });
  };

  const validateForm = () => {
    const newErrors = {
      jobcode: "",
      jobdesc: "",
    };

    let isValid = true;

    if (!jobcode.trim()) {
      newErrors.jobcode = "Job code is required";
      isValid = false;
    }

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
        .insert([
          {
            jobcode,
            jobdesc,
          },
        ]);

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          setErrors({
            ...errors,
            jobcode: "This job code already exists",
          });
          toast({
            title: "Error adding job",
            description: "This job code already exists",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: "Job added successfully",
        });
        resetForm();
        onJobAdded();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Error adding job",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error adding job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Job</DialogTitle>
            <DialogDescription>
              Create a new job title to be used in the employee job assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jobcode" className="text-right">
                Job Code
              </Label>
              <div className="col-span-3">
                <Input
                  id="jobcode"
                  value={jobcode}
                  onChange={(e) => setJobcode(e.target.value)}
                />
                {errors.jobcode && (
                  <p className="text-sm text-destructive mt-1">{errors.jobcode}</p>
                )}
              </div>
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
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobAddDialog;
