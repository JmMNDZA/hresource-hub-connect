
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import JobHistoryEditDialog from "./JobHistoryEditDialog";

interface JobHistoryListDialogProps {
  type: "department" | "job";
  code: string;
  name: string;
  onClose: () => void;
}

interface JobHistory {
  empno: string;
  effdate: string;
  jobcode: string;
  job_title?: string;
  deptcode: string | null;
  dept_name?: string | null;
  salary: number | null;
  employee_name?: string;
}

const JobHistoryListDialog: React.FC<JobHistoryListDialogProps> = ({
  type,
  code,
  name,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [editingRecord, setEditingRecord] = useState<JobHistory | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<JobHistory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchJobHistory = async () => {
    setIsLoading(true);
    try {
      // Fetch job history records based on type (department or job)
      const query = supabase
        .from("jobhistory")
        .select(`
          empno, effdate, jobcode, deptcode, salary,
          job:jobcode(jobcode, jobdesc),
          department:deptcode(deptcode, deptname),
          employee:empno(empno, firstname, lastname)
        `);
      
      // Apply the appropriate filter based on type
      if (type === "department") {
        query.eq("deptcode", code);
      } else {
        query.eq("jobcode", code);
      }
      
      const { data, error } = await query.order("effdate", { ascending: false });

      if (error) throw error;

      // Transform data to include job title, department name, and employee name
      const transformedData = data.map((item: any) => ({
        empno: item.empno,
        effdate: item.effdate,
        jobcode: item.jobcode,
        job_title: item.job?.jobdesc || "Unknown",
        deptcode: item.deptcode,
        dept_name: item.department?.deptname || "Unknown",
        salary: item.salary,
        employee_name: item.employee 
          ? `${item.employee.firstname || ""} ${item.employee.lastname || ""}`.trim() 
          : "Unknown"
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
  }, [type, code]);

  const handleDelete = async () => {
    if (!deleteRecord) return;
    
    try {
      const { error } = await supabase
        .from("jobhistory")
        .delete()
        .eq("empno", deleteRecord.empno)
        .eq("effdate", deleteRecord.effdate)
        .eq("jobcode", deleteRecord.jobcode);

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
    } finally {
      setDeleteDialogOpen(false);
      setDeleteRecord(null);
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
            {type === "department" 
              ? `Employees in Department: ${name} (${code})`
              : `Employees with Job: ${name} (${code})`
            }
          </DialogTitle>
        </DialogHeader>

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
                  <TableHead>Employee</TableHead>
                  <TableHead>Effective Date</TableHead>
                  {type === "department" ? (
                    <TableHead>Job</TableHead>
                  ) : (
                    <TableHead>Department</TableHead>
                  )}
                  <TableHead>Salary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobHistory.map((record) => (
                  <TableRow key={`${record.empno}-${record.effdate}-${record.jobcode}`}>
                    <TableCell>{record.employee_name}</TableCell>
                    <TableCell>{formatDate(record.effdate)}</TableCell>
                    {type === "department" ? (
                      <TableCell>{record.job_title}</TableCell>
                    ) : (
                      <TableCell>{record.dept_name || "N/A"}</TableCell>
                    )}
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
                        onClick={() => {
                          setDeleteRecord(record);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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

        {/* Edit Dialog */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job history record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteRecord(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default JobHistoryListDialog;
