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
import { format } from "date-fns";
import { Trash, Edit, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EmployeeEditDialog from "./EmployeeEditDialog";
import JobHistoryDialog from "./JobHistoryDialog";

interface EmployeeListProps {
  employees: any[];
  isLoading: boolean;
  onDelete: (empno: string) => Promise<void>;
  onUpdate: (empno: string, updatedData: any) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  isLoading,
  onDelete,
  onUpdate,
  onRefresh,
}) => {
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [jobHistoryEmployee, setJobHistoryEmployee] = useState<any | null>(null);
  const [deletingEmpno, setDeletingEmpno] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleEditClick = (employee: any) => {
    setEditingEmployee(employee);
  };

  const handleDeleteClick = async (empno: string) => {
    if (window.confirm("Are you sure you want to delete this employee? This will also delete their entire job history.")) {
      setDeletingEmpno(empno);
      try {
        await onDelete(empno);
        toast({
          title: "Employee deleted",
          description: "Employee and their job history have been successfully removed",
        });
      } catch (error: any) {
        toast({
          title: "Error deleting employee",
          description: error.message,
          variant: "destructive",
        });
        console.error("Delete employee error:", error);
      } finally {
        setDeletingEmpno(null);
      }
    }
  };

  const handleJobHistoryClick = (employee: any) => {
    setJobHistoryEmployee(employee);
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No employees found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Birth Date</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Separation Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.empno}>
                  <TableCell>{employee.empno}</TableCell>
                  <TableCell>{employee.firstname || "N/A"}</TableCell>
                  <TableCell>{employee.lastname || "N/A"}</TableCell>
                  <TableCell>{employee.gender || "N/A"}</TableCell>
                  <TableCell>{formatDate(employee.birthdate)}</TableCell>
                  <TableCell>{formatDate(employee.hiredate)}</TableCell>
                  <TableCell>{formatDate(employee.sepdate)}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(employee.empno)}
                      disabled={deletingEmpno === employee.empno}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleJobHistoryClick(employee)}
                      title="Manage Job History"
                    >
                      <Briefcase className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editingEmployee && (
        <EmployeeEditDialog
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={async (updatedData) => {
            await onUpdate(editingEmployee.empno, updatedData);
            setEditingEmployee(null);
          }}
        />
      )}

      {jobHistoryEmployee && (
        <JobHistoryDialog
          employee={jobHistoryEmployee}
          onClose={() => setJobHistoryEmployee(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

export default EmployeeList;
