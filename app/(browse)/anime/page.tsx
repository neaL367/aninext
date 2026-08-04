import { permanentRedirect } from "next/navigation";

export default function AnimeIndexPage() {
  permanentRedirect("/anime/trending");
}
