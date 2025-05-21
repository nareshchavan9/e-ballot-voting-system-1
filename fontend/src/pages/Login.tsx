import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { authService } from "@/services/api";

const formSchema = z.object({
  voterID: z.string().min(1, "Voter ID is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Get message from location state if it exists
    const state = location.state as { message?: string };
    if (state?.message) {
      setMessage(state.message);
      // Show the message as a toast
      toast({
        title: "Information",
        description: state.message,
      });
    }
  }, [location]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voterID: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await authService.login(data);
      
      // Check if user is admin
      if (response.user.role === 'admin') {
        toast({
          title: "Admin login successful!",
          description: "Welcome to the admin dashboard.",
        });
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Login successful!",
          description: "Welcome back to E-Ballot.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.response?.data?.message || "An error occurred during login",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <Button 
        variant="ghost" 
        className="mb-8" 
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Button>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Log in to E-Ballot</h1>
          <p className="text-gray-600 mt-2">
            Enter your credentials to access your account
          </p>
          {message && (
            <p className="text-blue-600 mt-2 text-sm">
              {message}
            </p>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="voterID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voter ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Voter ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-end">
              <Button variant="link" className="p-0" onClick={() => navigate("/forgot-password")}>
                Forgot password?
              </Button>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Button variant="link" className="p-0" onClick={() => navigate("/register")}>
            Register now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
