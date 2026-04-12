import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import BurnoutDetector from "@/components/dashboard/BurnoutDetector";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BurnoutDetector />
      {children}
    </>
  );
}
