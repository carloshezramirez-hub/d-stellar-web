import Image from "next/image";

export function StarField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -right-1/4 top-[-15%] size-[60vmin] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-stellar-pink), transparent 70%)" }}
      />
      <div
        className="absolute -left-1/4 bottom-[-20%] size-[55vmin] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-stellar-blue), transparent 70%)" }}
      />
      <Image
        src="/brand/illustrations/starburst-a-white.png"
        alt=""
        width={420}
        height={215}
        className="absolute -right-10 top-6 w-32 opacity-70 motion-safe:animate-drift sm:w-48 md:w-64"
      />
      <Image
        src="/brand/illustrations/starburst-cluster-white.png"
        alt=""
        width={266}
        height={239}
        className="absolute -left-6 bottom-8 w-24 opacity-60 motion-safe:animate-drift sm:w-36"
        style={{ animationDelay: "-6s" }}
      />
    </div>
  );
}
