import {
  PersonCreditsSection,
  type PersonCreditItem,
} from "@/components/person/person-credits-section";
import { DetailAsideCover } from "@/components/detail/detail-aside-cover";
import { DetailEntityHeader } from "@/components/detail/detail-entity-header";
import { DetailFactRow } from "@/components/detail/detail-fact-row";
import { DetailFactsPanel } from "@/components/detail/detail-facts-panel";
import { DetailStaticBreadcrumb } from "@/components/detail/detail-static-breadcrumb";
import { DetailSynopsisSection } from "@/components/detail/detail-synopsis-section";
import type { CharacterDetail, StaffDetail } from "@/lib/anilist/domain/types";
import {
  formatFuzzyDate,
  formatPersonName,
  formatValue,
} from "@/lib/anilist/display/format";
import { buildProgressiveImageSources } from "@/lib/anilist/display/image-urls";
import { DETAIL_BODY_GRID_CLASS } from "@/lib/styles/detail-page-layout";

type PersonKind = "character" | "staff";

type PersonDetailViewProps = {
  kind: PersonKind;
  person: CharacterDetail | StaffDetail;
};

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

  return (
    <>
      <DetailStaticBreadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Browse", href: "/anime" },
          { label: name },
        ]}
      />

      <div className={DETAIL_BODY_GRID_CLASS}>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <DetailAsideCover alt={name} sources={imageSources} />

          <DetailFactsPanel>
            <DetailFactRow label="Gender" value={formatValue(person.gender)} />
            <DetailFactRow label="Age" value={formatValue(person.age)} />
            <DetailFactRow
              label="Birthday"
              value={formatFuzzyDate(person.dateOfBirth)}
            />
            <DetailFactRow
              label="Blood type"
              value={formatValue(person.bloodType)}
            />
            <DetailFactRow
              label="Favourites"
              value={
                person.favourites != null ? String(person.favourites) : "—"
              }
            />
          </DetailFactsPanel>
        </aside>

        <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
          <DetailEntityHeader
            entityLabel={entityLabel}
            title={name}
            subtitle={nativeName}
          />

          {person.description ? (
            <DetailSynopsisSection title="Biography" text={person.description} />
          ) : null}

          {creditItems.length ? (
            <section className="flex flex-col gap-4 lg:gap-6">
              <h2 className="text-lg font-medium tracking-tight sm:text-xl">
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
