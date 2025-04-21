
// Home page for HR management system

import SignUpDialog from "@/components/SignUpDialog";
import SignInDialog from "@/components/SignInDialog";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#d3e4fd] via-[#f1f0fb] to-white flex items-center justify-center px-4 py-12">
      <div className="bg-white/80 shadow-xl rounded-2xl px-8 py-10 max-w-lg w-full flex flex-col items-center border border-[#e8e8fc] backdrop-blur-md">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A1F2C] mb-2 tracking-tight">
          HR Management System
        </h1>
        <p className="text-lg text-[#7E69AB] font-medium mb-8 text-center">
          Streamline your HR processes. Empower your team.<br />
          All-in-one web platform for modern HR management.
        </p>
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-xs">
          <SignInDialog />
          <SignUpDialog />
        </div>
      </div>
    </div>
  );
};

export default Index;

