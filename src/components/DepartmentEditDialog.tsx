
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DepartmentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepartmentUpdated: () => Promise<void>;
  deptcode: string;
  initialDeptname: string;
}

const DepartmentEditDialog: React.FC<DepartmentEditDialogProps> = ({
  open,
  onOpenChange,
  onDepartmentUpdated,
  deptcode,
  initialDeptname,
}) => {
  const [deptname, setDeptname] = useState(initialDeptname);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDeptname(initialDeptname);
    }
  }, [open, initialDeptname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Update department
      const { error } = await supabase
        .from("department")
        .update({ deptname: deptname || null })
        .eq("deptcode", deptcode);

      if (error) throw error;

      toast({
        title: "Department updated",
        description: "Department has been successfully updated",
      });
      
      // Close dialog and refresh list
      onOpenChange(false);
      await onDepartmentUpdated();
    } catch (error: any) {
      toast({
        title: "Error updating department",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error updating department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update the department name for {deptcode}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deptcode">Department Code</Label>
              <Input
                id="deptcode"
                value={deptcode}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deptname">Department Name</Label>
              <Input
                id="deptname"
                value={deptname}
                onChange={(e) => setDeptname(e.target.value)}
                placeholder="Enter department name"
                maxLength={100}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentEditDialog;
