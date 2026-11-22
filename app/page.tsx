import React from "react";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

export default function HomePage() {
  return (
    <div className="w-full">
      <HomeClient initialPlaceA={null} initialPlaceB={null} />
    </div>
  );
}
