export const poolCompConfig = {
    buyIn: 10,
    barInput: 50,
    xmasCut: 20,
    bigComp: {
        weeklyContributionPercentage: 0.5,
        mainCompPercentage: 0.7,
        mainCompFirstPlacePercentage: 0.7,
    },
    minCompSize: 8,
    maxCompSize: 32,
    minPlayers: 5
};

export type PoolCompConfig = typeof poolCompConfig;