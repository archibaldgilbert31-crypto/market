import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export function CategorySection({ title, children }: Props) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">{title}</h2>
      {children}
    </section>
  );
}
