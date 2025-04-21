
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: () => void;
}

const defaultForm = {
  firstname: "",
  lastname: "",
  gender: "",
  birthdate: "",
  hiredate: "",
  sepdate: "",
};

const EmployeeAddDialog: React.FC<EmployeeAddDialogProps> = ({
  open,
  onOpenChange,
  onEmployeeAdded,
}) => {
  const [form, setForm] = useState(defaultForm);
  const [empno, setEmpno] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNextEmpno();
      setForm(defaultForm);
    }
    // eslint-disable-next-line
  }, [open]);

  const fetchNextEmpno = async () => {
    // Fetch highest empno, increment by 2 and zero-pad
    // Ignore non-integer empnos
    const { data, error } = await supabase
      .from("employee")
      .select("empno")
      .order("empno", { ascending: false })
      .limit(1);

    let nextId = 65; // default if none found
    if (!error && data && data[0]) {
      // attempt parse, fallback to default if parse fails
      const last = parseInt(data[0].empno, 10);
      if (!Number.isNaN(last)) {
        nextId = last + 2;
      }
    }
    setEmpno(nextId.toString().padStart(5, "0"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic field validation
    if (
      !form.firstname.trim() ||
      !form.lastname.trim() ||
      !form.gender.trim() ||
      !form.birthdate.trim() ||
      !form.hiredate.trim()
    ) {
      toast({
        title: "All fields except separation date are required",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from("employee").insert([
        {
          empno: empno,
          firstname: form.firstname,
          lastname: form.lastname,
          gender: form.gender,
          birthdate: form.birthdate,
          hiredate: form.hiredate,
          sepdate: form.sepdate || null,
        },
      ]);
      if (error) throw error;

      toast({
        title: "Employee added",
        description: `Employee #${empno} has been added!`,
      });
      onOpenChange(false);
      onEmployeeAdded();
    } catch (error: any) {
      toast({
        title: "Error adding employee",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Fill all required details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Employee ID</label>
            <Input value={empno} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <Input
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <Input
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender (M/F)</label>
            <Input
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              maxLength={1}
              placeholder="M or F"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Birth Date</label>
            <Input
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              type="date"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hire Date</label>
            <Input
              name="hiredate"
              value={form.hiredate}
              onChange={handleChange}
              type="date"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Separation Date</label>
            <Input
              name="sepdate"
              value={form.sepdate}
              onChange={handleChange}
              type="date"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Employee"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAddDialog;
