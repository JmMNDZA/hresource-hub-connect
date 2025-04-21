
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../App";
import EmployeeList from "@/components/EmployeeList";
import { Search } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);

  // Fetch employee data
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Update filtered employees when search query or employees change
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
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleEmployeeDelete = async (empno: string) => {
    try {
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
        description: "Employee has been successfully removed",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting employee",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error deleting employee:", error);
    }
  };

  const handleEmployeeUpdate = async (empno: string, updatedData: any) => {
    try {
      const { error } = await supabase
        .from("employee")
        .update(updatedData)
        .eq("empno", empno);

      if (error) throw error;

      // Update the local state with the updated employee
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
            <CardTitle className="flex justify-between items-center">
              <span>Employee Management</span>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeList 
              employees={filteredEmployees} 
              isLoading={isLoading} 
              onDelete={handleEmployeeDelete}
              onUpdate={handleEmployeeUpdate}
              onRefresh={fetchEmployees}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
