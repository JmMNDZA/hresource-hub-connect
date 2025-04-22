
import SignUpDialog from "@/components/SignUpDialog";
import SignInDialog from "@/components/SignInDialog";
import { useAuth } from "../App";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, Layout } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Efficiently manage your workforce with comprehensive employee profiles and records."
    },
    {
      icon: Calendar,
      title: "Job History Tracking",
      description: "Track career progression and job changes within your organization seamlessly."
    },
    {
      icon: Layout,
      title: "Dashboard Analytics",
      description: "Get insights into your workforce with intuitive analytics and reporting tools."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#d3e4fd] via-[#f1f0fb] to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A1F2C] leading-tight mb-6">
              Streamline Your HR Operations with Modern Tools
            </h1>
            <p className="text-lg text-[#7E69AB] mb-8">
              Transform your HR processes with our comprehensive management system. 
              Experience seamless employee data management, career tracking, and organizational insights.
            </p>
            {user ? (
              <Button size="lg" asChild className="group">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <div className="flex flex-wrap gap-4">
                <SignInDialog />
                <SignUpDialog />
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-3xl transform rotate-3"></div>
              <img 
                src="/placeholder.svg"
                alt="HR Dashboard Preview"
                className="relative rounded-3xl shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-[#1A1F2C] mb-12">
            Powerful Features for Modern HR
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-[#e8e8fc] hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#7E69AB]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
