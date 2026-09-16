"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download, UserPlus, Check, ExternalLink, Sparkles } from "lucide-react";
import { generateResumeQrCodeUrl, downloadVCard, type VCardContact } from "@/lib/export/qr-vcard";
import { toast } from "sonner";
import Image from "next/image";

interface ResumeQrDialogProps {
  candidateName: string;
  resume: any;
  resumeCode?: string;
}

const COLOR_PRESETS = [
  { label: "Forest", hex: "102b2b" },
  { label: "Teal", hex: "0d8274" },
  { label: "Navy", hex: "1e3a8a" },
  { label: "Charcoal", hex: "18181b" },
  { label: "Burgundy", hex: "831843" },
];

export function ResumeQrDialog({ candidateName, resume, resumeCode }: ResumeQrDialogProps) {
  const [selectedColor, setSelectedColor] = useState("102b2b");
  const [copiedLink, setCopiedLink] = useState(false);

  // Derive resume URL from browser or fallback
  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://resumeforge.app/r/${resume?.slug || resume?.id || ""}`;

  const qrCodeUrl = generateResumeQrCodeUrl(currentUrl, {
    size: 400,
    color: selectedColor,
    format: "png",
    margin: 1,
  });

  const parsedData = resume?.data || {};
  const personalInfo = parsedData?.personal_info || parsedData?.contact || {};

  const handleDownloadVCard = () => {
    const contact: VCardContact = {
      fullName: candidateName || personalInfo?.name || "Candidate",
      jobTitle: parsedData?.title || parsedData?.desired_job_title || resume?.title,
      email: personalInfo?.email || resume?.user?.email,
      phone: personalInfo?.phone,
      location: personalInfo?.location || personalInfo?.city,
      resumeUrl: currentUrl,
      linkedinUrl: personalInfo?.linkedin,
      githubUrl: personalInfo?.github,
      websiteUrl: personalInfo?.website || personalInfo?.portfolio,
      summary: parsedData?.summary || parsedData?.objective,
    };

    const success = downloadVCard(contact);
    if (success) {
      toast.success("Candidate vCard (.vcf) downloaded!");
    } else {
      toast.error("Failed to export contact card");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      toast.success("Resume URL copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Could not copy URL");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs gap-1.5 border-neutral-300 hover:bg-neutral-100 rounded-none"
          title="Share via QR Code & vCard Contact"
        >
          <QrCode className="h-3.5 w-3.5 text-[#0d8274]" />
          <span className="hidden sm:inline">QR & vCard</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-none border-neutral-800 p-0 overflow-hidden bg-white">
        <div className="bg-[#102b2b] text-[#f8f4ec] p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <QrCode className="h-4 w-4" />
            </span>
            <DialogTitle className="text-base font-bold text-white tracking-tight">
              Smart QR & Recruiter Contact Card
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-300">
            Scan to instantly view this resume on mobile or add {candidateName} to phone contacts via vCard 3.0.
          </DialogDescription>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">
          {/* QR Code Container with High Quality Display */}
          <div className="p-3 bg-white border border-neutral-200 shadow-md flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt={`QR Code for ${candidateName}'s Resume`}
              width={200}
              height={200}
              className="w-48 h-48 block"
            />
            <span className="mt-2 text-[10px] font-mono text-neutral-500 tracking-wider uppercase">
              Scan with camera
            </span>
          </div>

          {/* Color Palettes */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium">QR Color:</span>
            <div className="flex items-center gap-1.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setSelectedColor(color.hex)}
                  className={`w-6 h-6 rounded-none transition-all flex items-center justify-center border ${
                    selectedColor === color.hex
                      ? "border-black scale-110 shadow-xs"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: `#${color.hex}` }}
                  title={color.label}
                >
                  {selectedColor === color.hex && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2 border-t border-neutral-100">
            <Button
              onClick={handleDownloadVCard}
              className="bg-[#102b2b] hover:bg-[#102b2b]/90 text-white rounded-none h-9 text-xs font-bold gap-2"
            >
              <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
              Save vCard (.vcf)
            </Button>

            <a
              href={qrCodeUrl}
              download={`${(candidateName || "resume").replace(/\s+/g, "_")}_qr.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-none h-9 text-xs font-bold gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              Download QR Image
            </a>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="text-[11px] text-neutral-500 hover:text-neutral-900 underline flex items-center gap-1"
          >
            {copiedLink ? <Check className="h-3 w-3 text-emerald-600" /> : <ExternalLink className="h-3 w-3" />}
            {copiedLink ? "Link copied to clipboard!" : "Copy resume direct link"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
