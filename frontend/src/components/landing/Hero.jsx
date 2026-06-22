import { Bot, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const suggestions = [
  "OMNIE calibration",
  "Battery Issues",
  "F20MT setup",
  "Fleet management",
];

export default function Hero() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({ defaultValues: { query: "" } });

  return (
    <section className="w-full bg-white px-3 py-10 dark:bg-black sm:px-4 sm:py-20 lg:py-[120px]">
      <div className="mx-auto max-w-3xl text-center">
        <div className="landing-hero-enter">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 sm:mb-6">
            <Bot size={25} />
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
            How can we help you today?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-zinc-400 sm:text-xl">
            Search for solutions, ask the community, or report an issue to our
            support team.
          </p>

          <form
            onSubmit={handleSubmit(({ query }) =>
              navigate(`/knowledge-base?q=${encodeURIComponent(query.trim())}`),
            )}
            className="mt-7 flex items-center rounded-xl border-2 border-slate-200 bg-white shadow-lg transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/15 dark:border-zinc-800 dark:bg-[#111111]"
          >
            <Search size={21} className="ml-4 shrink-0 text-slate-400" />
            <input
              placeholder="Search for solutions, articles, or questions..."
              className="h-14 w-full border-0 bg-transparent px-3 text-base text-slate-900 outline-none dark:text-white"
              {...register("query")}
            />
            <button
              type="submit"
              className="mr-1 inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-6 font-semibold text-white transition hover:scale-[1.02] hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">
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
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-800 dark:bg-[#111111] dark:text-zinc-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
