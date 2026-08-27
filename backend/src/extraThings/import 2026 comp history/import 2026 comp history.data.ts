export type HistoricalCompetitionSourceEntry = {
  competitionDate: string;
  registeredPlayerCount: number;
  mainCompetitionFirstPlaceName: string;
  mainCompetitionSecondPlaceName: string;
  secondChanceCompetitionFirstPlaceName?: string;
  secondChanceCompetitionSecondPlaceName?: string;
};

export function getHistoricalCompetitionSourceEntries(): HistoricalCompetitionSourceEntry[] {
  return [
    {
      competitionDate: "2026-01-08",
      registeredPlayerCount: 13,
      mainCompetitionFirstPlaceName: "Greg",
      mainCompetitionSecondPlaceName: "Alan",
    },
    {
      competitionDate: "2026-01-15",
      registeredPlayerCount: 18,
      mainCompetitionFirstPlaceName: "Mark H",
      mainCompetitionSecondPlaceName: "Rox",
      secondChanceCompetitionFirstPlaceName: "Paul",
      secondChanceCompetitionSecondPlaceName: "Dan",
    },
    {
      competitionDate: "2026-01-22",
      registeredPlayerCount: 19,
      mainCompetitionFirstPlaceName: "Ronnie",
      mainCompetitionSecondPlaceName: "Martin",
    },
    {
      competitionDate: "2026-01-29",
      registeredPlayerCount: 17,
      mainCompetitionFirstPlaceName: "Mark.H",
      mainCompetitionSecondPlaceName: "Tim",
    },
    {
      competitionDate: "2026-02-05",
      registeredPlayerCount: 14,
      mainCompetitionFirstPlaceName: "Martin",
      mainCompetitionSecondPlaceName: "Darren",
    },
    {
      competitionDate: "2026-02-12",
      registeredPlayerCount: 11,
      mainCompetitionFirstPlaceName: "Mark.H",
      mainCompetitionSecondPlaceName: "Daz",
    },
    {
      competitionDate: "2026-02-19",
      registeredPlayerCount: 15,
      mainCompetitionFirstPlaceName: "Greg",
      mainCompetitionSecondPlaceName: "Tim",
      secondChanceCompetitionFirstPlaceName: "Scorgie",
      secondChanceCompetitionSecondPlaceName: "Chris",
    },
    {
      competitionDate: "2026-02-26",
      registeredPlayerCount: 15,
      mainCompetitionFirstPlaceName: "Daz",
      mainCompetitionSecondPlaceName: "Myles",
    },
    {
      competitionDate: "2026-03-05",
      registeredPlayerCount: 14,
      mainCompetitionFirstPlaceName: "Daz",
      mainCompetitionSecondPlaceName: "Greg",
    },
    {
      competitionDate: "2026-03-12",
      registeredPlayerCount: 17,
      mainCompetitionFirstPlaceName: "Alan",
      mainCompetitionSecondPlaceName: "Daz",
    },
    {
      competitionDate: "2026-03-19",
      registeredPlayerCount: 16,
      mainCompetitionFirstPlaceName: "Daz",
      mainCompetitionSecondPlaceName: "Alan",
      secondChanceCompetitionFirstPlaceName: "Martin",
      secondChanceCompetitionSecondPlaceName: "Rox",
    },
    {
      competitionDate: "2026-03-26",
      registeredPlayerCount: 12,
      mainCompetitionFirstPlaceName: "Jack",
      mainCompetitionSecondPlaceName: "Daz",
    },
    {
      competitionDate: "2026-04-02",
      registeredPlayerCount: 20,
      mainCompetitionFirstPlaceName: "Greg",
      mainCompetitionSecondPlaceName: "Dan",
    },
    {
      competitionDate: "2026-04-09",
      registeredPlayerCount: 16,
      mainCompetitionFirstPlaceName: "Greg",
      mainCompetitionSecondPlaceName: "Sully",
    },
    {
      competitionDate: "2026-04-16",
      registeredPlayerCount: 17,
      mainCompetitionFirstPlaceName: "Mon",
      mainCompetitionSecondPlaceName: "George",
      secondChanceCompetitionFirstPlaceName: "Tim",
      secondChanceCompetitionSecondPlaceName: "Mark H",
    },
    {
      competitionDate: "2026-04-23",
      registeredPlayerCount: 12,
      mainCompetitionFirstPlaceName: "Myles",
      mainCompetitionSecondPlaceName: "Scorgie",
    },
    {
      competitionDate: "2026-04-30",
      registeredPlayerCount: 17,
      mainCompetitionFirstPlaceName: "Alan",
      mainCompetitionSecondPlaceName: "Charlie",
    },
    {
      competitionDate: "2026-05-07",
      registeredPlayerCount: 24,
      mainCompetitionFirstPlaceName: "Tim",
      mainCompetitionSecondPlaceName: "Greg",
    },
    {
      competitionDate: "2026-05-14",
      registeredPlayerCount: 15,
      mainCompetitionFirstPlaceName: "Daz",
      mainCompetitionSecondPlaceName: "Greg",
    },
    {
      competitionDate: "2026-05-21",
      registeredPlayerCount: 17,
      mainCompetitionFirstPlaceName: "Christian",
      mainCompetitionSecondPlaceName: "Greg",
      secondChanceCompetitionFirstPlaceName: "Daz",
      secondChanceCompetitionSecondPlaceName: "Dan",
    },
    {
      competitionDate: "2026-05-28",
      registeredPlayerCount: 13,
      mainCompetitionFirstPlaceName: "Mark",
      mainCompetitionSecondPlaceName: "Alan",
    },
    {
      competitionDate: "2026-06-04",
      registeredPlayerCount: 16,
      mainCompetitionFirstPlaceName: "George",
      mainCompetitionSecondPlaceName: "Greg",
    },
    {
      competitionDate: "2026-06-11",
      registeredPlayerCount: 15,
      mainCompetitionFirstPlaceName: "Daz",
      mainCompetitionSecondPlaceName: "Mark.H",
    },
    {
      competitionDate: "2026-06-18",
      registeredPlayerCount: 22,
      mainCompetitionFirstPlaceName: "Scorgie",
      mainCompetitionSecondPlaceName: "George",
      secondChanceCompetitionFirstPlaceName: "Sam",
      secondChanceCompetitionSecondPlaceName: "Kim",
    },
    {
      competitionDate: "2026-06-25",
      registeredPlayerCount: 19,
      mainCompetitionFirstPlaceName: "Daz",
      mainCompetitionSecondPlaceName: "Martin",
    },
    {
      competitionDate: "2026-07-02",
      registeredPlayerCount: 18,
      mainCompetitionFirstPlaceName: "Mark",
      mainCompetitionSecondPlaceName: "Paul",
    },
    {
      competitionDate: "2026-07-09",
      registeredPlayerCount: 16,
      mainCompetitionFirstPlaceName: "Greg",
      mainCompetitionSecondPlaceName: "Alan",
    },
    {
      competitionDate: "2026-07-16",
      registeredPlayerCount: 14,
      mainCompetitionFirstPlaceName: "Daz",
      mainCompetitionSecondPlaceName: "George",
      secondChanceCompetitionFirstPlaceName: "Myles",
      secondChanceCompetitionSecondPlaceName: "Sully",
    },
    {
      competitionDate: "2026-07-23",
      registeredPlayerCount: 14,
      mainCompetitionFirstPlaceName: "Alan",
      mainCompetitionSecondPlaceName: "Greg",
    },
    {
      competitionDate: "2026-07-30",
      registeredPlayerCount: 15,
      mainCompetitionFirstPlaceName: "Daz",
      mainCompetitionSecondPlaceName: "Martin",
    },
    {
      competitionDate: "2026-08-06",
      registeredPlayerCount: 17,
      mainCompetitionFirstPlaceName: "Alan",
      mainCompetitionSecondPlaceName: "Mark.H",
    },
    {
      competitionDate: "2026-08-13",
      registeredPlayerCount: 16,
      mainCompetitionFirstPlaceName: "Greg",
      mainCompetitionSecondPlaceName: "Daz",
    },
    {
      competitionDate: "2026-08-20",
      registeredPlayerCount: 21,
      mainCompetitionFirstPlaceName: "Paul",
      mainCompetitionSecondPlaceName: "Alan",
      secondChanceCompetitionFirstPlaceName: "George",
      secondChanceCompetitionSecondPlaceName: "Scorgie",
    },
  ];
}

export function getSourcePlayerNameToDatabasePlayerName(): Record<string, string> {
  return {
    Alan: "Alan",
    Charlie: "Charlie",
    Chris: "Cris",
    Christian: "Christian",
    Dan: "Daniel",
    Darren: "Darren",
    Daz: "Darren",
    George: "George",
    Greg: "Greg",
    Jack: "Jake",
    Jayson: "Jason",
    Kim: "Kim",
    Mark: "Mark Scottish",
    "Mark H": "Mark H",
    "Mark.H": "Mark H",
    Martin: "Martin",
    Mon: "Monique",
    Myles: "Myles",
    Paul: "Paul",
    Ronnie: "Ronel",
    Rox: "Roxy",
    Sam: "Sam",
    Scorgie: "Scorgie",
    Sully: "Sully",
    Tim: "Tim",
  };
}
