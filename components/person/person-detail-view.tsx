import Link from "next/link";
import type { Route } from "next";
import {
  PersonCreditsSection,
  type PersonCreditItem,
} from "@/components/person/person-credits-section";
import { ProgressiveImage } from "@/components/shared/progressive-image";
import type { CharacterDetail, StaffDetail } from "@/lib/anilist/domain/types";
import { AniListDescription } from "@/components/shared/anilist-description";
import {
  formatFuzzyDate,
  formatPersonName,
  formatValue,
} from "@/lib/anilist/display/format";
import { buildProgressiveImageSources } from "@/lib/anilist/display/image-urls";
import { PERSON_DETAIL_GRID_CLASS } from "@/lib/styles/person-page-layout";

type PersonKind = "character" | "staff";

type PersonDetailViewProps = {
  kind: PersonKind;
  person: CharacterDetail | StaffDetail;
};

function PersonFact({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;

  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium leading-snug">{value}</dd>
    </div>
  );
}

function getMediaCredits(kind: PersonKind, person: CharacterDetail | StaffDetail) {
  if (kind === "character") {
    return (person as CharacterDetail).media?.edges ?? [];
  }

  return (person as StaffDetail).staffMedia?.edges ?? [];
}

function getCreditRole(
  kind: PersonKind,
  edge: NonNullable<
    | NonNullable<CharacterDetail["media"]>["edges"]
    | NonNullable<StaffDetail["staffMedia"]>["edges"]
  >[number]
) {
  if (kind === "character" && edge && "characterRole" in edge) {
    return edge.characterRole;
  }

  if (edge && "staffRole" in edge) {
    return edge.staffRole;
  }

  return null;
}

export function PersonDetailView({ kind, person }: PersonDetailViewProps) {
  const name = formatPersonName(person.name);
  const imageSources = buildProgressiveImageSources(person.image?.large);
  const nativeName =
    person.name?.native && person.name.native !== name ? person.name.native : null;
  const credits = getMediaCredits(kind, person).filter(
    (edge): edge is NonNullable<typeof edge> & {
      node: NonNullable<NonNullable<typeof edge>["node"]>;
    } => Boolean(edge?.node?.id)
  );
  const creditItems: PersonCreditItem[] = credits.map((edge) => ({
    key: `${edge.node.id}-${getCreditRole(kind, edge) ?? "role"}`,
    media: edge.node,
    role: getCreditRole(kind, edge),
  }));
  const entityLabel = kind === "character" ? "Character" : "Staff";
  const browseHref = (kind === "character" ? "/anime" : "/anime") as Route;

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" prefetch className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={browseHref} prefetch className="hover:text-foreground">
              Browse
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="truncate text-foreground">{name}</li>
        </ol>
      </nav>

      <div className={PERSON_DETAIL_GRID_CLASS}>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[13rem] overflow-hidden rounded-xl border border-border bg-muted shadow-lg ring-1 ring-border/60 sm:max-w-[15rem] lg:mx-0 lg:max-w-none">
            {imageSources.length ? (
              <ProgressiveImage
                sources={imageSources}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 240px, 260px"
                priority
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card/50 p-4">
            <p className="text-sm font-medium">Information</p>
            <dl className="flex flex-col gap-2.5">
              <PersonFact label="Gender" value={formatValue(person.gender)} />
              <PersonFact label="Age" value={formatValue(person.age)} />
              <PersonFact
                label="Birthday"
                value={formatFuzzyDate(person.dateOfBirth)}
              />
              <PersonFact
                label="Blood type"
                value={formatValue(person.bloodType)}
              />
              <PersonFact
                label="Favourites"
                value={
                  person.favourites != null
                    ? String(person.favourites)
                    : "—"
                }
              />
            </dl>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-3 border-b border-border pb-6">
            <p className="text-sm font-medium text-muted-foreground">
              {entityLabel}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {name}
            </h1>
            {nativeName ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {nativeName}
              </p>
            ) : null}
          </header>

          {person.description ? (
            <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
              <h2 className="mb-3 text-lg font-medium tracking-tight">
                Biography
              </h2>
              <AniListDescription text={person.description} />
            </section>
          ) : null}

          {creditItems.length ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-medium tracking-tight">
                {kind === "character" ? "Anime & manga roles" : "Works"}
              </h2>
              <PersonCreditsSection credits={creditItems} kind={kind} />
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
