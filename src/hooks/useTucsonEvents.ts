import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TUCSON_EVENTS, type TucsonEvent, type Season, type EventCategory } from "@/data/tucsonEvents";

interface LiveEvent {
  id: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  month: string;
  season: string;
  category: string;
  event_date: string | null;
  source_url: string | null;
  scraped_month: string;
}

interface TucsonEventsResult {
  events: TucsonEvent[];
  isLive: boolean;
  loading: boolean;
  scrapedMonth: string | null;
}

function mapLiveToStatic(live: LiveEvent[]): TucsonEvent[] {
  return live.map((e) => ({
    id: e.id,
    name: { en: e.name_en, es: e.name_es },
    month: e.month,
    season: e.season as Season,
    category: e.category as EventCategory,
    description: { en: e.description_en, es: e.description_es },
  }));
}

async function fetchLiveEvents(): Promise<{ events: LiveEvent[]; scraped_month: string | null }> {
  const { data, error } = await supabase.functions.invoke("get-tucson-events");
  if (error || !data?.events?.length) throw new Error("No live events");
  return data;
}

export function useTucsonEvents(): TucsonEventsResult {
  const { data, isLoading } = useQuery({
    queryKey: ["tucson-events"],
    queryFn: fetchLiveEvents,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });

  if (data?.events?.length) {
    return {
      events: mapLiveToStatic(data.events),
      isLive: true,
      loading: isLoading,
      scrapedMonth: data.scraped_month,
    };
  }

  return {
    events: TUCSON_EVENTS,
    isLive: false,
    loading: isLoading,
    scrapedMonth: null,
  };
}
