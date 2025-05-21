import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

enum PopularPlanType {
  NO = 0,
  YES = 1,
}

interface PricingProps {
  title: string;
  popular: PopularPlanType;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
}

const pricingList: PricingProps[] = [
  {
    title: "Free Forever",
    popular: PopularPlanType.NO,
    price: 0,
    description: "The core RSVP system, always free.",
    buttonText: "Get Started",
    benefitList: [
      "Unlimited Events",
      "Unlimited Guests per Event",
      "Shareable RSVP Links",
      "Event Management Dashboard",
      "Guest List Management (Import/Manual)",
      "Custom Event Details & Image",
      "Custom RSVP Questions",
    ],
  },
  {
    title: "Pro WhatsApp",
    popular: PopularPlanType.YES,
    price: 29.99,
    description: "Everything in Free, plus powerful WhatsApp integration.",
    buttonText: "Start Free Trial",
    benefitList: [
      "All Free Forever features",
      "Connect 1 WhatsApp Account (QR Scan)",
      "View WhatsApp Contacts in Dashboard",
      "Add WhatsApp Contacts to Guest List",
      "Bulk Send WhatsApp Invites (1-Click)",
      "Customize Invite Message",
      "Quick Reply Buttons for RSVP",
      "Button to RSVP Link in Invite",
      "Unlimited WhatsApp Messages",
    ],
  },
  {
    title: "Planner Suite",
    popular: PopularPlanType.NO,
    price: 19.99, // This will be clarified with "/account" text later
    description: "For event planners managing multiple client accounts.",
    buttonText: "Contact Us",
    benefitList: [
      "All Pro WhatsApp features",
      "$19.99/month per WhatsApp Account",
      "Connect Multiple Client WhatsApp Accounts",
      "Send Invites from Client's Number",
      "Assign WhatsApp Accounts per Event",
      "Use Multiple Accounts for One Event",
    ],
  },
];

export const Pricing = () => {
  return (
    <section
      id="pricing"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center">
        Simple, Transparent
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          Pricing{" "}
        </span>
      </h2>
      <h3 className="text-xl text-center text-muted-foreground pt-4 pb-8">
        Choose the perfect plan for your event needs. Start free or unlock powerful WhatsApp features.
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pricingList.map((pricing: PricingProps) => (
          <Card
            key={pricing.title}
            className={
              pricing.popular === PopularPlanType.YES
                ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10"
                : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex item-center justify-between">
                {pricing.title}
                {pricing.popular === PopularPlanType.YES ? (
                  <Badge
                    variant="secondary"
                    className="text-sm text-primary"
                  >
                    Most popular
                  </Badge>
                ) : null}
              </CardTitle>
              <div>
                <span className="text-3xl font-bold">${pricing.price}</span>
                <span className="text-muted-foreground">{pricing.title === "Planner Suite" ? " /account/month" : " /month"}</span>
              </div>

              <CardDescription>{pricing.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <Button className="w-full">{pricing.buttonText}</Button>
            </CardContent>

            <hr className="w-4/5 m-auto mb-4" />

            <CardFooter className="flex">
              <div className="space-y-4">
                {pricing.benefitList.map((benefit: string) => (
                  <span
                    key={benefit}
                    className="flex"
                  >
                    <Check className="text-green-500" />{" "}
                    <h3 className="ml-2">{benefit}</h3>
                  </span>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
