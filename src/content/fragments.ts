import type { MemoryFragment } from '@/entities/memoryFragment';

export const MEMORY_FRAGMENTS: readonly MemoryFragment[] = [
  {
    id: 'fragment-01',
    regionId: 'region-1',
    corruption: 61,
    text: 'Log 03 - Arrival. Atmosphere reads clean. No signs of hostile life. The signal is still there, exactly where the survey said it would be. Command wants daily reports. This place feels... watched.',
  },
  {
    id: 'fragment-02',
    regionId: 'region-1',
    corruption: 48,
    text: "Log 11 - Something is wrong with our instruments near the ruins. Compass spins. Chronometers drift. Kade says it's magnetic interference. I don't think it is.",
  },
  {
    id: 'fragment-03',
    regionId: 'region-2',
    corruption: 55,
    text: "Log 19 - The structures predate anything in the historical record. Whoever built this was not primitive. The wall patterns... I keep thinking I've seen this architecture before. In a maintenance manual, of all places.",
  },
  {
    id: 'fragment-04',
    regionId: 'region-2',
    corruption: 39,
    text: "Log 24 - Kade won't come out of the east chamber. Says the walls are 'listening'. I told him to get some rest. He looked at me like I was the one who didn't understand.",
  },
  {
    id: 'fragment-05',
    regionId: 'region-3',
    corruption: 72,
    text: 'Log 31 - The signal is not a broadcast. It is a question. It has been asking the same question for thousands of years, to no one. We were never meant to answer it.',
  },
  {
    id: 'fragment-06',
    regionId: 'region-3',
    corruption: 12,
    text: "Log 33 - Final entry, if anyone finds this. It isn't hostile. It just... recognized something in us it was not looking for. I don't think it will make that mistake again. To whoever comes next: it isn't waiting for a person.",
  },
];
