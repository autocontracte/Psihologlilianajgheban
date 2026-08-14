import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Welcome } from "@/components/sections/Welcome";
import { Audiences } from "@/components/sections/Audiences";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Approach } from "@/components/sections/Approach";
import { Formats } from "@/components/sections/Formats";
import { TestsTeaser } from "@/components/sections/TestsTeaser";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Welcome />
        <Audiences />
        <Services />
        <About />
        <Approach />
        <Formats />
        <TestsTeaser />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
