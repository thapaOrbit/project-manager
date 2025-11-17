import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle, Loader, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { toast } from "sonner";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const { mutate } = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      setStatus("loading"); 
      mutate(
        { token },
        {
          onSuccess: () => setStatus("success"),
          onError: (error: any) => {
            console.log(error);
            toast.error(error.response?.data?.message || "Verification failed");
            setStatus("error");
          },
        }
      );
    }
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <Loader className="w-10 h-10 text-gray-500 animate-spin" />
            <h3 className="text-lg font-semibold">Verifying email...</h3>
            <p className="text-sm text-gray-500">
              Please wait while we verify your email.
            </p>
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle className="w-10 h-10 text-green-500" />
            <h3 className="text-lg font-semibold">Email Verified</h3>
            <p className="text-sm text-gray-500">
              Your email has been verified successfully.
            </p>
            <Link to="/sign-in" className="text-sm text-blue-500 mt-6">
              <Button variant="outline">Back to Sign in</Button>
            </Link>
          </>
        );
      case "error":
        return (
          <>
            <XCircle className="w-10 h-10 text-red-500" />
            <h3 className="text-lg font-semibold">Email Verification Failed</h3>
            <p className="text-sm text-gray-500">
              Your email verification failed. Please try again.
            </p>
            <Link to="/sign-in" className="text-sm text-blue-500 mt-6">
              <Button variant="outline">Back to Sign in</Button>
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Verify Email</h1>

      {/* Only render Card once verification starts */}
      {status !== "idle" && (
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-6">
            {renderContent()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VerifyEmail;
