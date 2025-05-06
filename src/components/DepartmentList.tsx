
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
import { Edit, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import JobHistoryListDialog from "./JobHistoryListDialog";

interface Department {
  deptcode: string;
  deptname: string | null;
}

interface DepartmentListProps {
  departments: Department[];
  isLoading: boolean;
  onDelete: (deptcode: string) => Promise<void>;
  onUpdate: (deptcode: string, updatedData: { deptname: string }) => Promise<void>;
  onRefresh: () => Promise<void>;
  onAdd: () => void;
  isReadOnly?: boolean;
}

const DepartmentList: React.FC<DepartmentListProps> = ({
  departments,
  isLoading,
  onDelete,
  onUpdate,
  onRefresh,
  onAdd,
  isReadOnly = false,
}) => {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);

  const handleDelete = async (deptcode: string) => {
    try {
      setDeleting(deptcode);
      await onDelete(deptcode);
    } catch (error) {
      console.error("Error during deletion:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdate = (deptcode: string, deptname: string) => {
    onUpdate(deptcode, { deptname });
  };

  return (
    <div>
      {!isReadOnly && (
        <div className="flex justify-end mb-4">
          <Button onClick={onAdd} variant="default">
            Add New Department
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Department Code</TableHead>
              <TableHead>Department Name</TableHead>
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
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((department) => (
                <TableRow key={department.deptcode}>
                  <TableCell className="font-medium">{department.deptcode}</TableCell>
                  <TableCell>{department.deptname || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingDept(department)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Employees</span>
                      </Button>
                      {!isReadOnly && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdate(department.deptcode, department.deptname || "")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(department.deptcode)}
                            disabled={deleting === department.deptcode}
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

      {/* Department History Dialog */}
      {viewingDept && (
        <JobHistoryListDialog
          type="department"
          code={viewingDept.deptcode}
          name={viewingDept.deptname || ""}
          onClose={() => setViewingDept(null)}
        />
      )}
    </div>
  );
};

export default DepartmentList;
