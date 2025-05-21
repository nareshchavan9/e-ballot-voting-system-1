import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleViewElections = () => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    } else {
      // If not logged in, redirect to login with a message
      navigate('/login', { state: { message: 'Please log in to view elections' } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">E-Ballot</h1>
            </div>
            <div>
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
              <Button 
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Secure Electronic Voting System</h2>
            <p className="text-lg text-gray-600 mb-8">
              Vote securely, transparently, and conveniently in elections that matter to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="text-lg"
              >
                Cast Your Vote
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleViewElections}
                className="text-lg"
              >
                View Elections
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <FeatureCard 
              title="Secure" 
              description="Industry-standard encryption and security protocols protect your vote." 
            />
            <FeatureCard 
              title="Convenient" 
              description="Vote anywhere, anytime from your preferred device." 
            />
            <FeatureCard 
              title="Transparent" 
              description="Verified results available for audit while maintaining anonymity." 
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-gray-500">
          <p>© 2025 E-Ballot System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;
