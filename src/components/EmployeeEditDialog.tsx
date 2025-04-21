
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface EmployeeEditDialogProps {
  employee: any;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

const EmployeeEditDialog: React.FC<EmployeeEditDialogProps> = ({
  employee,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    firstname: employee.firstname || "",
    lastname: employee.lastname || "",
    gender: employee.gender || "",
    birthdate: employee.birthdate ? employee.birthdate.substring(0, 10) : "",
    hiredate: employee.hiredate ? employee.hiredate.substring(0, 10) : "",
    sepdate: employee.sepdate ? employee.sepdate.substring(0, 10) : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Clean up data before saving
    const dataToSave = { ...formData };
    
    // Only include fields that have values
    Object.keys(dataToSave).forEach((key) => {
      const typedKey = key as keyof typeof dataToSave;
      if (dataToSave[typedKey] === "") {
        dataToSave[typedKey] = null;
      }
    });

    try {
      await onSave(dataToSave);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the employee's information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstname" className="text-right">
                First Name
              </Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastname" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender
              </Label>
              <Input
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="col-span-3"
                placeholder="M or F"
                maxLength={1}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthdate" className="text-right">
                Birth Date
              </Label>
              <Input
                id="birthdate"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hiredate" className="text-right">
                Hire Date
              </Label>
              <Input
                id="hiredate"
                name="hiredate"
                type="date"
                value={formData.hiredate}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sepdate" className="text-right">
                Separation Date
              </Label>
              <Input
                id="sepdate"
                name="sepdate"
                type="date"
                value={formData.sepdate}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeEditDialog;
