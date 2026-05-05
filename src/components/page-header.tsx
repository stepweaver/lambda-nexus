export function PageHeader({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}
