
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import JobHistoryEditDialog from "./JobHistoryEditDialog";

interface JobHistoryEntry {
  empno: string;
  jobcode: string;
  deptcode: string | null;
  effdate: string;
  salary: number | null;
  // Join data
  employee?: {
    firstname: string | null;
    lastname: string | null;
    sepdate: string | null;
  };
  job?: {
    jobdesc: string | null;
  };
  department?: {
    deptname: string | null;
  };
}

interface JobHistoryListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterType: "job" | "department";
  filterCode: string;
  title: string;
}

const JobHistoryListDialog: React.FC<JobHistoryListDialogProps> = ({
  open,
  onOpenChange,
  filterType,
  filterCode,
  title,
}) => {
  const [jobHistory, setJobHistory] = useState<JobHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JobHistoryEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchJobHistory();
    }
  }, [open, filterCode, filterType]);

  const fetchJobHistory = async () => {
    setLoading(true);
    try {
      // First, get all job history entries for the specified filter
      const query = supabase
        .from("jobhistory")
        .select(`
          empno,
          jobcode,
          deptcode,
          effdate,
          salary,
          employee:employee!jobhistory_empno_fkey(firstname, lastname, sepdate),
          job:job!jobhistory_jobcode_fkey(jobdesc),
          department:department!jobhistory_deptcode_fkey(deptname)
        `)
        .order("effdate", { ascending: false });

      // Apply filter based on the filterType
      if (filterType === "job") {
        query.eq("jobcode", filterCode);
      } else {
        query.eq("deptcode", filterCode);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setJobHistory([]);
        setLoading(false);
        return;
      }
      
      // Filter out employees with separation dates
      let filteredData = data.filter(entry => entry.employee && entry.employee.sepdate === null);
      
      // Process to get only the latest entry per employee
      const latestEntries = filteredData.reduce((acc, current) => {
        const existingEntry = acc.find(item => item.empno === current.empno);
        
        if (!existingEntry) {
          // Add if no entry exists for this employee
          acc.push(current);
        } else {
          // Replace if this entry is newer than the existing one
          const currentDate = new Date(current.effdate);
          const existingDate = new Date(existingEntry.effdate);
          
          if (currentDate > existingDate) {
            const index = acc.findIndex(item => item.empno === current.empno);
            acc[index] = current;
          }
        }
        
        return acc;
      }, [] as JobHistoryEntry[]);
      
      // Ensure proper type casting and set state
      setJobHistory(latestEntries);
    } catch (error: any) {
      toast({
        title: "Error fetching job history",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error fetching job history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (entry: JobHistoryEntry) => {
    setCurrentEntry(entry);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentEntry) return;

    try {
      const { empno, jobcode, effdate } = currentEntry;
      const { error } = await supabase
        .from("jobhistory")
        .delete()
        .eq("empno", empno)
        .eq("jobcode", jobcode)
        .eq("effdate", effdate);

      if (error) throw error;

      toast({
        title: "Job history entry deleted",
        description: "The job history entry has been successfully deleted",
      });
      
      // Refresh the list
      await fetchJobHistory();
    } catch (error: any) {
      toast({
        title: "Error deleting job history entry",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error deleting job history entry:", error);
    } finally {
      setDeleteDialogOpen(false);
      setCurrentEntry(null);
    }
  };

  const handleEdit = (entry: JobHistoryEntry) => {
    setCurrentEntry(entry);
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : jobHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No job history entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobHistory.map((entry) => (
                    <TableRow key={`${entry.empno}-${entry.jobcode}-${entry.effdate}`}>
                      <TableCell>{entry.empno}</TableCell>
                      <TableCell>
                        {entry.employee?.firstname} {entry.employee?.lastname}
                      </TableCell>
                      <TableCell>{entry.job?.jobdesc}</TableCell>
                      <TableCell>{entry.department?.deptname}</TableCell>
                      <TableCell>{formatDate(entry.effdate)}</TableCell>
                      <TableCell>
                        {entry.salary ? `$${entry.salary.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(entry)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job history entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {currentEntry && (
        <JobHistoryEditDialog
          record={{
            empno: currentEntry.empno,
            effdate: currentEntry.effdate,
            jobcode: currentEntry.jobcode,
            deptcode: currentEntry.deptcode || "",
            salary: currentEntry.salary,
            jobdesc: currentEntry.job?.jobdesc || "",
            dept_name: currentEntry.department?.deptname || ""
          }}
          onClose={() => setEditDialogOpen(false)}
          onSuccess={fetchJobHistory}
        />
      )}
    </>
  );
};

export default JobHistoryListDialog;
