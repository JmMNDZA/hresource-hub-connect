
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobHistoryAddDialogProps {
  employee: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface Job {
  jobcode: string;
  jobdesc: string | null;
}

interface Department {
  deptcode: string;
  deptname: string | null;
}

const JobHistoryAddDialog: React.FC<JobHistoryAddDialogProps> = ({
  employee,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    effdate: "",
    jobcode: "",
    deptcode: "",
    salary: "",
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from("job")
          .select("jobcode, jobdesc")
          .order("jobdesc", { ascending: true });

        if (jobsError) throw jobsError;
        setJobs(jobsData || []);

        // Fetch departments
        const { data: deptData, error: deptError } = await supabase
          .from("department")
          .select("deptcode, deptname")
          .order("deptname", { ascending: true });

        if (deptError) throw deptError;
        setDepartments(deptData || []);
      } catch (error: any) {
        toast({
          title: "Error fetching options",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!form.effdate || !form.jobcode) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare data for submission
      const newJobHistory = {
        empno: employee.empno,
        effdate: form.effdate,
        jobcode: form.jobcode,
        deptcode: form.deptcode || null,
        salary: form.salary ? parseFloat(form.salary) : null,
      };

      // Insert into Supabase
      const { error } = await supabase
        .from("jobhistory")
        .insert([newJobHistory]);

      if (error) throw error;

      toast({
        title: "Job history added",
        description: "New job history record has been added successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error adding job history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Job History</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Effective Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="effdate"
              value={form.effdate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Job <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.jobcode}
              onValueChange={(value) => handleSelectChange("jobcode", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.jobcode} value={job.jobcode}>
                    {job.jobdesc} ({job.jobcode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Select
              value={form.deptcode}
              onValueChange={(value) => handleSelectChange("deptcode", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.deptcode} value={dept.deptcode}>
                    {dept.deptname} ({dept.deptcode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Salary</label>
            <Input
              type="number"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="Enter salary amount"
              step="0.01"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobHistoryAddDialog;
