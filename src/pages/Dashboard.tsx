
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../App";
import EmployeeList from "@/components/EmployeeList";
import EmployeeAddDialog from "@/components/EmployeeAddDialog";
import JobList from "@/components/JobList";
import JobAddDialog from "@/components/JobAddDialog";
import JobEditDialog from "@/components/JobEditDialog";
import { Search, Plus } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employees");
  
  // Employee state
  const [searchQuery, setSearchQuery] = useState("");
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  
  // Jobs state
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [addJobDialogOpen, setAddJobDialogOpen] = useState(false);
  const [editJobDialogOpen, setEditJobDialogOpen] = useState(false);
  const [currentJobCode, setCurrentJobCode] = useState("");
  const [currentJobDesc, setCurrentJobDesc] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter((employee) => {
      const firstName = employee.firstname?.toLowerCase() || "";
      const lastName = employee.lastname?.toLowerCase() || "";
      const empNo = employee.empno?.toLowerCase() || "";

      return firstName.includes(query) ||
        lastName.includes(query) ||
        empNo.includes(query);
    });

    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    setIsEmployeesLoading(true);
    try {
      const { data, error } = await supabase
        .from("employee")
        .select("*")
        .order("lastname", { ascending: true });

      if (error) {
        throw error;
      }

      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching employees",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error fetching employees:", error);
    } finally {
      setIsEmployeesLoading(false);
    }
  };

  const fetchJobs = async () => {
    setIsJobsLoading(true);
    try {
      const { data, error } = await supabase
        .from("job")
        .select("*")
        .order("jobcode", { ascending: true });

      if (error) {
        throw error;
      }

      setJobs(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching jobs",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error fetching jobs:", error);
    } finally {
      setIsJobsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleEmployeeDelete = async (empno: string) => {
    try {
      // First delete all job history records for this employee
      const { error: jobHistoryError } = await supabase
        .from("jobhistory")
        .delete()
        .eq("empno", empno);

      if (jobHistoryError) throw jobHistoryError;
      
      // Then delete the employee record
      const { error } = await supabase
        .from("employee")
        .delete()
        .eq("empno", empno);

      if (error) throw error;

      setEmployees(prevEmployees =>
        prevEmployees.filter(employee => employee.empno !== empno)
      );

      toast({
        title: "Employee deleted",
        description: "Employee and their job history have been successfully removed",
      });
      console.log("Employee and job history deleted successfully:", empno);
    } catch (error: any) {
      toast({
        title: "Error deleting employee",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error deleting employee:", error);
      throw error;
    }
  };

  const handleEmployeeUpdate = async (empno: string, updatedData: any) => {
    try {
      const { error } = await supabase
        .from("employee")
        .update(updatedData)
        .eq("empno", empno);

      if (error) throw error;

      setEmployees(prevEmployees =>
        prevEmployees.map(employee =>
          employee.empno === empno ? { ...employee, ...updatedData } : employee
        )
      );

      toast({
        title: "Employee updated",
        description: "Employee details have been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Error updating employee",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error updating employee:", error);
    }
  };

  const handleJobDelete = async (jobcode: string) => {
    try {
      // Check if job is used in jobhistory
      const { data: jobHistory, error: checkError } = await supabase
        .from("jobhistory")
        .select("empno")
        .eq("jobcode", jobcode)
        .limit(1);

      if (checkError) throw checkError;

      if (jobHistory && jobHistory.length > 0) {
        toast({
          title: "Cannot delete job",
          description: "This job is associated with employee history records and cannot be deleted",
          variant: "destructive",
        });
        return;
      }

      // Delete the job record
      const { error } = await supabase
        .from("job")
        .delete()
        .eq("jobcode", jobcode);

      if (error) throw error;

      setJobs(prevJobs =>
        prevJobs.filter(job => job.jobcode !== jobcode)
      );

      toast({
        title: "Job deleted",
        description: "Job has been successfully removed",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting job",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error deleting job:", error);
      throw error;
    }
  };

  const handleJobUpdate = async (jobcode: string, updatedData: { jobdesc: string }) => {
    setCurrentJobCode(jobcode);
    setCurrentJobDesc(updatedData.jobdesc);
    setEditJobDialogOpen(true);
  };

  const handleJobUpdateSubmit = async () => {
    await fetchJobs();
  };

  const handleAddEmployeeClick = () => {
    setAddEmployeeDialogOpen(true);
  };

  const handleAddJobClick = () => {
    setAddJobDialogOpen(true);
  };

  const handleEmployeeAdded = async () => {
    await fetchEmployees();
  };

  const handleJobAdded = async () => {
    await fetchJobs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#d3e4fd] via-[#f1f0fb] to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1F2C]">HR Dashboard</h1>
            <p className="text-[#7E69AB]">
              Welcome back, {user?.email}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <Tabs defaultValue="employees" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="employees">Employees</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="employees">
                <CardTitle className="flex justify-between items-center">
                  <span>Employee Management</span>
                  <div className="flex gap-4">
                    <div className="relative w-full max-w-xs">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                    <Button onClick={handleAddEmployeeClick} variant="default" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Employee
                    </Button>
                  </div>
                </CardTitle>
              </TabsContent>
              
              <TabsContent value="jobs">
                <CardTitle>
                  <span>Job Management</span>
                </CardTitle>
              </TabsContent>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="employees" className="mt-0">
              <EmployeeList
                employees={filteredEmployees}
                isLoading={isEmployeesLoading}
                onDelete={handleEmployeeDelete}
                onUpdate={handleEmployeeUpdate}
                onRefresh={fetchEmployees}
              />
            </TabsContent>
            
            <TabsContent value="jobs" className="mt-0">
              <JobList
                jobs={jobs}
                isLoading={isJobsLoading}
                onDelete={handleJobDelete}
                onUpdate={handleJobUpdate}
                onRefresh={fetchJobs}
                onAdd={handleAddJobClick}
              />
            </TabsContent>
          </CardContent>
        </Card>
        
        {/* Dialogs */}
        <EmployeeAddDialog
          open={addEmployeeDialogOpen}
          onOpenChange={setAddEmployeeDialogOpen}
          onEmployeeAdded={handleEmployeeAdded}
        />
        
        <JobAddDialog
          open={addJobDialogOpen}
          onOpenChange={setAddJobDialogOpen}
          onJobAdded={handleJobAdded}
        />
        
        <JobEditDialog
          open={editJobDialogOpen}
          onOpenChange={setEditJobDialogOpen}
          onJobUpdated={handleJobUpdateSubmit}
          jobcode={currentJobCode}
          initialJobdesc={currentJobDesc}
        />
      </div>
    </div>
  );
};

export default Dashboard;
