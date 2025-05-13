
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import JobHistoryListDialog from "./JobHistoryListDialog";

interface Job {
  jobcode: string;
  jobdesc: string | null;
}

interface JobListProps {
  jobs: Job[];
  isLoading: boolean;
  onDelete: (jobcode: string) => Promise<void>;
  onUpdate: (jobcode: string, updatedData: { jobdesc: string }) => Promise<void>;
  onRefresh: () => Promise<void>;
  onAdd: () => void;
  isReadOnly?: boolean;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  isLoading,
  onDelete,
  onUpdate,
  onRefresh,
  onAdd,
  isReadOnly = false,
}) => {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [jobHistoryDialogOpen, setJobHistoryDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleDelete = async (jobcode: string) => {
    try {
      setDeleting(jobcode);
      await onDelete(jobcode);
    } catch (error) {
      console.error("Error during deletion:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleViewEmployees = (job: Job) => {
    setSelectedJob(job);
    setJobHistoryDialogOpen(true);
  };

  return (
    <div>
      {!isReadOnly && (
        <div className="flex justify-end mb-4">
          <Button onClick={onAdd} variant="default">
            Add New Job
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Job Code</TableHead>
              <TableHead>Job Description</TableHead>
              <TableHead className="text-right w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No jobs found.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.jobcode}>
                  <TableCell className="font-medium">{job.jobcode}</TableCell>
                  <TableCell>{job.jobdesc || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEmployees(job)}
                        className="flex items-center gap-1"
                      >
                        <List className="h-4 w-4" />
                        View Employees
                      </Button>
                      {!isReadOnly && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdate(job.jobcode, { jobdesc: job.jobdesc || "" })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(job.jobcode)}
                            disabled={deleting === job.jobcode}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedJob && (
        <JobHistoryListDialog
          open={jobHistoryDialogOpen}
          onOpenChange={setJobHistoryDialogOpen}
          filterType="job"
          filterCode={selectedJob.jobcode}
          title={`Employees in ${selectedJob.jobdesc || selectedJob.jobcode}`}
        />
      )}
    </div>
  );
};

export default JobList;
