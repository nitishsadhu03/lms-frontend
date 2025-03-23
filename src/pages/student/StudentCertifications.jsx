import StudentSidebar from "@/components/student/StudentSidebar";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

const backend_url = import.meta.env.VITE_API_URL;

const StudentCertifications = () => {
  const studentProfile = useSelector((state) => state.userAuth.profile);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${backend_url}/teacher/actions/certificates`
      );
      // Filter only eligible certificates
      const eligibleCerts = response.data.certificates.filter(
        (cert) => cert.isEligible
      );
      setCertificates(eligibleCerts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch certificates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const downloadCertificate = (certificate) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      // Draw the certificate template
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add student name - centered below "THIS CERTIFICATE IS PRESEND TO :"
      ctx.font = "bold 36px Quattrocento";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(studentProfile.name, canvas.width / 2, 400);

      // Add course completion text - centered
      ctx.font = "bold 24px Quattrocento";
      ctx.textAlign = "center";
      ctx.fillText(
        `On successful completion of the course ${certificate.courseId.name} with Fcc`,
        canvas.width / 2,
        460
      );

      // Add completion date - centered and below the course text
      ctx.font = "bold 20px Quattrocento";
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      ctx.fillText(
        `Completed on: ${new Date(certificate.issuedAt).toLocaleDateString(
          "en-GB",
          options
        )}`,
        canvas.width / 2,
        500
      );

      // Generate download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${certificate.courseId.name}_Certificate.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    };

    // Certificate template image
    img.src = "/assets/certificate-template.png";
  };

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold">Certifications</h1>
        <hr className="my-4" />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <Card key={cert._id} className="p-4 shadow-md">
                <div className="flex flex-col space-y-3">
                  <h3 className="font-medium text-lg">
                    {cert.courseId.name} Course
                  </h3>
                  <p className="text-sm text-gray-600">
                    Issued:{" "}
                    {new Date(cert.issuedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                  <Button
                    onClick={() => downloadCertificate(cert)}
                    className="mt-2 w-full flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download Certificate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">
              No eligible certificates available
            </h3>
            <p className="text-gray-500 mt-2">
              Complete all course requirements to earn certificates
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCertifications;
