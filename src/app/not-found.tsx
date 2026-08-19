import Link from "next/link";

export default function NotFound() {
  return (
    <div className="surface p-6">
      <h1 className="font-display text-2xl">Seite nicht gefunden</h1>
      <p className="mt-3 text-fg-muted">Diese Route gehört nicht zum Lernpfad.</p>
      <Link href="/" className="btn btn-primary mt-5">
        Zur Übersicht
      </Link>
    </div>
  );
}
