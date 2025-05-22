import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FilePlus, Users, Share2, Sparkles } from "lucide-react";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <FilePlus size={48} className="text-primary" />,
    title: "Create Your Event",
    description:
      "Effortlessly set up your event. Choose a date, time, and location. Customize your event details.",
  },
  {
    icon: <Users size={48} className="text-primary" />,
    title: "Add Your Guests",
    description:
      "Import guests or add them manually. Manage attendance with ease.",
  },
  {
    icon: <Share2 size={48} className="text-primary" />,
    title: "Share Link & Send Invites",
    description:
      "Receive a unique RSVP link instantly. Send WhatsApp invites with a quick QR scan.",
  },
  {
    icon: <Sparkles size={48} className="text-primary" />,
    title: "Unlimited Access",
    description:
      "Our core RSVP system is 100% free forever. Get a 5 day free trial for Whatsapp invitations.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        Create & Manage Your Events in{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Minutes
        </span>
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Follow these simple steps to create your event, share it with guests, and manage RSVPs effortlessly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-muted/50"
          >
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
