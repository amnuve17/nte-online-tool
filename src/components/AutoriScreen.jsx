import t from "../i18n/index.js";
import AuthorCard from "./AuthorCard.jsx";
import Header from "./Header.jsx";
import PageShell from "./PageShell.jsx";

const AUTHORS = [
  {
    name: 'Nicola "Amnuve" Buenza',
    role: "Idea, Sviluppo",
    image: "/authors/nicola.png",
    socials: [
      { type: "instagram", url: "https://www.instagram.com/amnuve/" },
      { type: "youtube", url: "https://www.youtube.com/@amnuve" },
    ],
  },
  {
    name: "Lorenzo Di Nucci",
    role: "Design",
    image: "/authors/lorenzo.png",
    socials: [
      { type: "behance", url: "https://www.behance.net/lorenzodinucci" },
    ],
  },
];

export default function AutoriScreen({ onMenuClick, onNavigate }) {
  return (
    <PageShell onNavigate={onNavigate}>
      <Header variant="plain" onMenuClick={onMenuClick} onNavigate={onNavigate} />

      <div className="space-y-8 px-6 pb-10">
        <h2 className="font-display text-2xl uppercase tracking-tight">
          {t.autori.title}
        </h2>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {AUTHORS.map((author) => (
            <AuthorCard key={author.name} {...author} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
