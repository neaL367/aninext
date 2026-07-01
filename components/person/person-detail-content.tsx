import { PersonDetailView } from "@/components/person/person-detail-view";
import type { SlugDetailParams } from "@/lib/anilist/domain/detail-route-params";
import { resolveCharacterDetail } from "@/lib/anilist/server/resolve-character-detail";
import { resolveStaffDetail } from "@/lib/anilist/server/resolve-staff-detail";

type PersonDetailLoaderProps = {
  params: SlugDetailParams;
};

export async function CharacterDetailBodyLoader({ params }: PersonDetailLoaderProps) {
  const character = await resolveCharacterDetail(params);
  return <PersonDetailView kind="character" person={character} />;
}

export async function StaffDetailBodyLoader({ params }: PersonDetailLoaderProps) {
  const staff = await resolveStaffDetail(params);
  return <PersonDetailView kind="staff" person={staff} />;
}
