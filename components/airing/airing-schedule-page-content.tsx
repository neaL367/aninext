import { AiringScheduleInteractive } from "@/components/airing/airing-schedule-interactive";
import { getAiringDayPromisesForRequest } from "@/lib/anilist/server/get-airing-schedules";

export async function AiringSchedulePageContent() {
  const { dateKeys, dayPromises } = await getAiringDayPromisesForRequest();

  return (
    <AiringScheduleInteractive dateKeys={dateKeys} dayPromises={dayPromises} />
  );
}
