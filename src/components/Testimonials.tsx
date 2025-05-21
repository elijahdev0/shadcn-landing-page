import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TestimonialProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
}

const testimonials: TestimonialProps[] = [
  {
    image: "https://randomuser.me/api/portraits/men/32.jpg", // Placeholder
    name: "Alex P.",
    userName: "@PartyTimeAlex",
    comment:
      "Honestly, sending invites via WhatsApp was a game-changer for my last-minute get-together. Scan a QR, pick contacts, done! The whole system is so straightforward, and the fact that the main RSVP features are completely free is just amazing.",
  },
  {
    image: "https://randomuser.me/api/portraits/women/68.jpg", // Placeholder
    name: "Brenda K.",
    userName: "@CommunityEventsBK",
    comment:
      "We run on a tight budget, so finding a robust RSVP platform that's genuinely free for core use was incredible. It's so easy to set up an event and share the link. No complicated steps, just simple and effective. Our community loves it!",
  },
  {
    image: "https://github.com/shadcn.png", // Placeholder
    name: "Sam R.",
    userName: "@BigDaySam",
    comment:
      "For our wedding, managing RSVPs felt daunting until we found this. The WhatsApp invite feature saved us SO much time. Guests found it super easy to respond, and the core platform being free meant we could allocate budget elsewhere. Seriously impressed!",
  },
  {
    image: "https://randomuser.me/api/portraits/women/44.jpg", // Placeholder
    name: "Chloe T.",
    userName: "@WorkshopWhiz",
    comment:
      "I needed a no-fuss way to handle sign-ups for my workshops. This platform is incredibly user-friendly. Setting up an event takes minutes, and the free core features cover everything I need. Plus, the option for WhatsApp invites is a brilliant touch for quick reminders!",
  },
  {
    image: "https://randomuser.me/api/portraits/men/67.jpg", // Placeholder
    name: "Mike G.",
    userName: "@CorpEventMike",
    comment:
      "Our corporate events require quick turnarounds. The WhatsApp invite feature is incredibly efficient for last-minute updates. Plus, the core platform being free and so easy to navigate saves us significant admin time. A fantastic tool!",
  },
  {
    image: "https://randomuser.me/api/portraits/women/79.jpg", // Placeholder
    name: "Jessica L.",
    userName: "@ReunionJess",
    comment:
      "Organizing a large family reunion felt overwhelming until I found this. Sending invites via WhatsApp was a breeze, and everyone loved how simple it was to RSVP. The fact that it's free for all the essential features is just the cherry on top!",
  },
];

export const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        Event Planning Made
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          Simple & Free!{" "}
        </span>
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        Discover why users love our intuitive RSVP system, free core features, and seamless WhatsApp invites.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2  lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card
              key={userName}
              className="max-w-md md:break-inside-avoid overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage
                    alt=""
                    src={image}
                  />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>{userName}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>{comment}</CardContent>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
