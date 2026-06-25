import {
  Bot,
  Search,
  Ticket,
  BookOpen,
  MessageCircle,
  Star,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import heroBackground from "../../assets/images/human.png";

const suggestions = [
  "OMNIE calibration",
  "Battery Issues",
  "F20MT setup",
  "Fleet management",
];

const quickActions = [
  {
    icon: Ticket,
    title: "Report Issue",
    description: "Create a support ticket",
    link: "/tickets/create",
    color: "blue",
  },
  {
    icon: BookOpen,
    title: "Browse Solutions",
    description: "Search knowledge base",
    link: "/knowledge-base",
    color: "green",
  },
  {
    icon: MessageCircle,
    title: "Ask Community",
    description: "Get help from other users",
    link: "/forum",
    color: "purple",
  },
  {
    icon: Star,
    title: "Suggest Feature",
    description: "Vote on new ideas",
    link: "/features",
    color: "orange",
  },
];

const colorClasses = {
  blue: "hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:bg-blue-950/20",
  green:
    "hover:border-green-300 hover:bg-green-50 dark:hover:border-green-700 dark:hover:bg-green-950/20",
  purple:
    "hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-700 dark:hover:bg-purple-950/20",
  orange:
    "hover:border-orange-300 hover:bg-orange-50 dark:hover:border-orange-700 dark:hover:bg-orange-950/20",
};

export default function Hero() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({ defaultValues: { query: "" } });

  return (
    <section
      className="relative -mt-16 h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        height: "100vh",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto w-full max-w-4xl text-center">
          <div className="landing-hero-enter space-y-10">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              KIT Support Hub
            </span>

            {/* Icon with animation */}
            <div className="animate-bounce">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50/90 text-blue-600 backdrop-blur-sm dark:bg-blue-950/60 dark:text-blue-300">
                <Bot size={28} />
              </span>
            </div>

            {/* Heading */}
            <h1
              className="text-4xl font-bold sm:text-5xl lg:text-6xl"
              style={{ color: "white" }}
            >
              How can we help you today?
            </h1>

            {/* Subheading */}
            <p className="mx-auto max-w-2xl text-lg text-white/80 sm:text-xl">
              Get instant answers, connect with experts, and solve robot issues
              faster than ever.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSubmit(({ query }) =>
                navigate(
                  `/knowledge-base?q=${encodeURIComponent(query.trim())}`,
                ),
              )}
              className="mx-auto mt-10 flex max-w-2xl items-center rounded-xl border-2 border-slate-200 bg-white shadow-lg transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/30"
            >
              <Search size={21} className="ml-4 shrink-0 text-slate-400" />
              <input
                placeholder="Search for solutions, articles, or questions..."
                className="h-14 w-full border-0 bg-transparent px-3 text-base text-slate-900 outline-none"
                {...register("query")}
              />
              <button
                type="submit"
                className="mr-1 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 font-semibold text-white transition hover:scale-[1.02] hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            {/* Popular Suggestions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-white/60">
                Popular:
              </span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/knowledge-base?q=${encodeURIComponent(suggestion)}`,
                    )
                  }
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
