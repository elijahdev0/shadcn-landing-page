import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import image from "../assets/growth.png";
import image3 from "../assets/reflecting.png";
import image4 from "../assets/looking-ahead.png";

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: "All-in-One Event Creation",
    description:
      "Create unlimited events with custom details, images, and RSVP questions. No account needed to start, with optional account saving and PIN-protected admin access.",
    image: image4,
  },
  {
    title: "Effortless Guest Management",
    description:
      "Easily upload guests via Excel/CSV or add manually. Track RSVPs in real-time, filter your list, and even manage check-ins for in-person events.",
    image: image3,
  },
  {
    title: "Direct WhatsApp Integration",
    description:
      "Connect WhatsApp via QR scan (5-day free trial). Send bulk invites, use templates, and import contacts directly. No Business API needed!",
    image: image,
  },
  {
    title: "Customize Your Event's Look & Feel",
    description:
      "Upload digital invite images, choose themes (light/dark/custom), and brand your mobile-optimized RSVP page with custom messages and host names.",
    image: image4, // Reusing image4
  },
  {
    title: "Powerful Admin Tools & Reporting",
    description:
      "Edit events, resend invites, export guest lists, add co-hosts, and receive email summary reports. Duplicate events easily for recurring needs.",
    image: image3, // Reusing image3
  },
];

export const Features = () => {
  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Explore Our{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Powerful Features
        </span>
      </h2>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-4xl mx-auto" // Adjusted width for better carousel display
      >
        <CarouselContent>
          {features.map(({ title, description, image }: FeatureProps, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="h-full flex flex-col"> {/* Ensure cards take full height for alignment */}
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">{description}</CardContent> {/* Allow content to grow */}
                  <CardFooter>
                    <img
                      src={image}
                      alt={title} // More descriptive alt text
                      className="w-[200px] lg:w-[250px] mx-auto mt-4" // Adjusted image size
                    />
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};
