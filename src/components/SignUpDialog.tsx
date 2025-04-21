
import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const SignUpDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = React.useState<{ [k: string]: string }>({});
  const [loading, setLoading] = React.useState(false);

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.name.trim()) errs.name = "Name required";
    if (!form.email.trim()) errs.email = "Email required";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password required";
    else if (form.password.length < 6) errs.password = "At least 6 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    return errs;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
        setForm({ name: "", email: "", password: "", confirm: "" });
        toast({ title: "Sign up successful!", description: "Welcome aboard 👋" });
      }, 900);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-auto border-primary text-primary hover:bg-primary/10 font-semibold"
        >
          Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create your account</DialogTitle>
          <DialogDescription>Join the HR Management System</DialogDescription>
        </DialogHeader>
        <form className="mt-2 space-y-3" onSubmit={onSubmit} noValidate>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoFocus autoComplete="name" value={form.name} onChange={onChange} />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} />
            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={onChange} />
            {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={onChange} />
            {errors.confirm && <span className="text-xs text-red-500">{errors.confirm}</span>}
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose asChild>
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" aria-label="Close">&times;</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpDialog;

