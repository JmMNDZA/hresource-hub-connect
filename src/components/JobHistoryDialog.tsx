
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Edit, Plus } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import JobHistoryAddDialog from "./JobHistoryAddDialog";
import JobHistoryEditDialog from "./JobHistoryEditDialog";

interface JobHistoryDialogProps {
  employee: any;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}

interface JobHistory {
  empno: string;
  effdate: string;
  jobcode: string;
  job_title?: string;
  deptcode: string | null;
  dept_name?: string | null;
  salary: number | null;
}

const JobHistoryDialog: React.FC<JobHistoryDialogProps> = ({
  employee,
  onClose,
  onRefresh,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<JobHistory | null>(null);

  const fetchJobHistory = async () => {
    setIsLoading(true);
    try {
      // Fetch job history records with job titles and department names
      const { data, error } = await supabase
        .from("jobhistory")
        .select(`
          empno, effdate, jobcode, deptcode, salary,
          job:jobcode(jobcode, jobdesc),
          department:deptcode(deptcode, deptname)
        `)
        .eq("empno", employee.empno)
        .order("effdate", { ascending: false });

      if (error) throw error;

      // Transform data to include job title and department name
      const transformedData = data.map((item: any) => ({
        empno: item.empno,
        effdate: item.effdate,
        jobcode: item.jobcode,
        job_title: item.job?.jobdesc || "Unknown",
        deptcode: item.deptcode,
        dept_name: item.department?.deptname || "Unknown",
        salary: item.salary,
      }));

      setJobHistory(transformedData);
    } catch (error: any) {
      toast({
        title: "Error fetching job history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobHistory();
  }, [employee.empno]);

  const handleDeleteJobHistory = async (empno: string, effdate: string, jobcode: string) => {
    if (window.confirm("Are you sure you want to delete this job history record?")) {
      try {
        const { error } = await supabase
          .from("jobhistory")
          .delete()
          .eq("empno", empno)
          .eq("effdate", effdate)
          .eq("jobcode", jobcode);

        if (error) throw error;

        toast({
          title: "Job history deleted",
          description: "Record has been successfully removed",
        });
        
        fetchJobHistory();
      } catch (error: any) {
        toast({
          title: "Error deleting job history",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatSalary = (salary: number | null) => {
    if (salary === null) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(salary);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Job History for {employee.firstname} {employee.lastname} ({employee.empno})
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium">Job History Records</h3>
          <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Job History
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : jobHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No job history records found
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobHistory.map((record) => (
                  <TableRow key={`${record.empno}-${record.effdate}-${record.jobcode}`}>
                    <TableCell>{formatDate(record.effdate)}</TableCell>
                    <TableCell>{record.job_title} ({record.jobcode})</TableCell>
                    <TableCell>
                      {record.dept_name ? `${record.dept_name} (${record.deptcode})` : "N/A"}
                    </TableCell>
                    <TableCell>{formatSalary(record.salary)}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingRecord(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => 
                          handleDeleteJobHistory(record.empno, record.effdate, record.jobcode)
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>

        {addDialogOpen && (
          <JobHistoryAddDialog
            employee={employee}
            onClose={() => setAddDialogOpen(false)}
            onSuccess={() => {
              fetchJobHistory();
              setAddDialogOpen(false);
            }}
          />
        )}

        {editingRecord && (
          <JobHistoryEditDialog
            record={editingRecord}
            onClose={() => setEditingRecord(null)}
            onSuccess={() => {
              fetchJobHistory();
              setEditingRecord(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobHistoryDialog;
