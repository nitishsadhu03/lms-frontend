import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, SquarePlus } from "lucide-react";
import React from "react";

const CreateCertificate = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen h-full bg-gray-50">
        <h1 className="text-xl font-semibold">Create Certificate</h1>
        <hr className="my-2" />
        <div className="my-16 w-full">
          <Card className="flex flex-col w-64 shadow-[0_3px_10px_rgb(0,0,0,0.2)] mx-auto">
            <div className="p-6 mx-auto">
              <ShieldCheck size={70} />
            </div>
            <CardContent className="">
              <Button className="w-full bg-primary hover:bg-primary/85">
                <SquarePlus className="w-5 h-5" />
                Create Certificate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateCertificate;
