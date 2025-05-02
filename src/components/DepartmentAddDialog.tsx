
import React, { useState } from "react";
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

interface DepartmentAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepartmentAdded: () => Promise<void>;
}

const DepartmentAddDialog: React.FC<DepartmentAddDialogProps> = ({
  open,
  onOpenChange,
  onDepartmentAdded,
}) => {
  const [deptcode, setDeptcode] = useState("");
  const [deptname, setDeptname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deptcode) {
      toast({
        title: "Department code required",
        description: "Please enter a department code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if department code already exists
      const { data: existingDept, error: checkError } = await supabase
        .from("department")
        .select("deptcode")
        .eq("deptcode", deptcode)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingDept) {
        toast({
          title: "Department code already exists",
          description: "Please use a different department code",
          variant: "destructive",
        });
        return;
      }

      // Add new department
      const { error } = await supabase
        .from("department")
        .insert({
          deptcode,
          deptname: deptname || null,
        });

      if (error) throw error;

      toast({
        title: "Department added",
        description: "Department has been successfully added",
      });
      
      // Reset form and close dialog
      setDeptcode("");
      setDeptname("");
      onOpenChange(false);
      await onDepartmentAdded();
    } catch (error: any) {
      toast({
        title: "Error adding department",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error adding department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDeptcode("");
    setDeptname("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription>
            Enter the details for the new department.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deptcode">Department Code</Label>
              <Input
                id="deptcode"
                value={deptcode}
                onChange={(e) => setDeptcode(e.target.value)}
                placeholder="Enter department code"
                maxLength={20}
                required
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
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting || !deptcode}>
              {isSubmitting ? "Adding..." : "Add Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentAddDialog;
