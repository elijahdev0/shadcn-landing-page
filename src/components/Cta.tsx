import { Button } from "./ui/button";

export const Cta = () => {
  return (
    <section
      id="cta"
      className="bg-muted/50 py-16 my-24 sm:my-32" // Reverted to muted background
    >
      <div className="container lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold ">
            Stop Stressing, Start Celebrating!
            <span className="block text-4xl md:text-5xl font-extrabold mt-2 bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text"> {/* Added gradient to span */}
              Effortless RSVPs Are Here.
            </span>
          </h2>
          <p className="text-muted-foreground text-xl mt-4 mb-8 lg:mb-0"> {/* Reverted to muted-foreground */}
            Launch your event in minutes with our forever-free core platform. Upgrade anytime for powerful WhatsApp invites and pro features that your guests will love.
          </p>
        </div>

        <div className="space-y-4 lg:col-start-2 lg:justify-self-end flex flex-col sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
          <Button
            size="lg"
            className="w-full sm:w-auto" // Default primary button style
          >
            Create Your Free Event Now
          </Button>
          <Button
            size="lg"
            variant="outline" // Default outline button style
            className="w-full sm:w-auto"
          >
            Explore WhatsApp Features
          </Button>
        </div>
      </div>
    </section>
  );
};
