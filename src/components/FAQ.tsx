import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Do my guests need an account to RSVP?",
    answer:
      "No, not at all! Guests can RSVP directly via the unique link you share. No sign-ups or logins are required for them, making it super easy for everyone.",
    value: "item-1",
  },
  {
    question: "Is the core RSVP system really free forever?",
    answer:
      "Yes! Our core RSVP system, which includes unlimited events, unlimited guests, shareable links, and guest list management, is 100% free, forever.",
    value: "item-2",
  },
  {
    question: "How does the WhatsApp integration work?",
    answer:
      "It's simple! You connect your own WhatsApp account (personal or business) by scanning a QR code. Then, you can import contacts, customize messages, and send bulk invites directly from your number. No complex API setup is needed.",
    value: "item-3",
  },
  {
    question: "Can I customize the RSVP questions for my event?",
    answer:
      "Absolutely! You can add custom questions to your RSVP form to gather specific information like meal preferences, +1s, or any other details you need for your event.",
    value: "item-4",
  },
  {
    question:
      "What if I need to manage events for multiple clients using WhatsApp?",
    answer:
      "Our 'Planner Suite' is designed for you! It allows you to connect multiple WhatsApp accounts (e.g., your clients' accounts) at $19.99/month per connected account, so you can send invites directly from their numbers. Please contact us for more details on this plan.",
    value: "item-5",
  },
  {
    question:
      "Is there a limit to the number of WhatsApp messages I can send with the paid plans?",
    answer:
      "With our 'Pro WhatsApp' and 'Planner Suite' plans, you get unlimited WhatsApp messages. The 'Free Forever' plan does not include direct WhatsApp sending through our system, but you can always share your RSVP link via WhatsApp manually.",
    value: "item-6",
  },
];

export const FAQ = () => {
  return (
    <section
      id="faq"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "}
        <a
          rel="noreferrer noopener"
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};
