import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Architecture } from "@/components/sections/Architecture";
import { TechStack } from "@/components/sections/TechStack";
import { SmartTrafficTerminal } from "@/components/sections/SmartTrafficTerminal";
import { NexoraFlowCanvas } from "@/components/sections/NexoraFlowCanvas";
import { EnterpriseGovernanceBento } from "@/components/sections/EnterpriseGovernanceBento";
import { ExpansionRoadmap3D } from "@/components/sections/ExpansionRoadmap3D";
import { FooterCTA } from "@/components/sections/FooterCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Architecture />
      <TechStack />
      <SmartTrafficTerminal />
      <NexoraFlowCanvas />
      <EnterpriseGovernanceBento />
      <ExpansionRoadmap3D />
      <FooterCTA />
    </>
  );
}
