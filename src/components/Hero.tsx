import { Button } from "./ui/button";
import { HeroCards } from "./HeroCards";

export const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-4xl md:text-5xl font-bold">
          <h1>
            Effortless RSVPs.
            <br />
            <span className="text-primary">Instant WhatsApp Invitations.</span>
          </h1>
        </main>

        <p className="text-lg text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Create your event in minutes, manage guests seamlessly, and send
          beautiful invites via WhatsApp. Our core platform is 100% free.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Button className="w-full md:w-auto">Get Started</Button>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10">
        <HeroCards />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
