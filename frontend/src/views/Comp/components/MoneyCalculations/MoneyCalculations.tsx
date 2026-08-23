import { format, parseISO } from "date-fns";
import { enAU } from "date-fns/locale";
import { useEffect } from "react";
import type { PoolComp } from "../../../../../../shared/domain";
import { poolCompConfig } from "../../../../../../shared/poolCompConfig";
import { useAppContext } from "../../../../AppContext";
import {
  calculateBigCompFirstPrizeMoney,
  calculateBigCompSecondPrizeMoney,
  calculateCompBigCompContribution,
  calculateSecondChanceFirstPrizeMoney,
  dateIsTheThirdThursdayOfTheMonth,
  getBigCompTotalPrizePool,
  getChristmasContributionTotal,
  getCompsFromThePreviousMonthsThirdThursday,
  getCompsTowardTheNextBigComp,
} from "../../../../services/bigComp.service";
import { calculateFirstPrizeMoney } from "../../../../services/poolComp.service";

export function MoneyCalculations() {
  const { activePoolComp, activeHistoricalComp, compHistory, send } = useAppContext();
  const comp = activeHistoricalComp ?? activePoolComp!;
  const isBigComp = Boolean(comp.secondChanceSlots?.length);

  useEffect(() => {
    send(["getFullCompHistory"]);
  }, []);

  const { buyIn, bigComp, barInput, xmasCut } = poolCompConfig;
  const { contributionPercentage, mainCompPercentage, mainCompFirstPlacePercentage } = bigComp;

  const numberOfPlayers = comp.registeredPlayers.length;
  const totalBuyIns = numberOfPlayers * buyIn;
  const firstPlacePrizeMoneyPercentage = 1 - contributionPercentage;
  const firstPlacePrizeMoney = calculateFirstPrizeMoney(comp);
  const bigCompContribution = calculateCompBigCompContribution(comp);

  return (
    <money-calculations className="panel-container">
      <panel-heading>Money Calculations</panel-heading>

      <fields-container>
        <comp-data-heading>Comp Data</comp-data-heading>
        {isBigComp
          ? bigCompDataFields()
          : regularCompDataFields()}
      </fields-container>

      <fields-container>
        <comp-data-heading>Base Values</comp-data-heading>
        <field-group>
          <field-label>Buyin per player</field-label>
          <field-value>${buyIn}</field-value>
        </field-group>
        <field-group>
          <field-label>Bar input</field-label>
          <field-value>${barInput}</field-value>
        </field-group>
        <field-group>
          <field-label>Christmas Contribution</field-label>
          <field-value>${xmasCut}</field-value>
        </field-group>
        <field-group>
          <field-label>First place prize money percentage</field-label>
          <field-value>{firstPlacePrizeMoneyPercentage * 100}%</field-value>
        </field-group>
        <field-group>
          <field-label>Big comp contribution percentage</field-label>
          <field-value>{contributionPercentage * 100}%</field-value>
        </field-group>
        <field-group>
          <field-label>Main comp percentage</field-label>
          <field-value>{mainCompPercentage * 100}%</field-value>
        </field-group>
        <field-group>
          <field-label>Main comp first place percentage</field-label>
          <field-value>{mainCompFirstPlacePercentage * 100}%</field-value>
        </field-group>
      </fields-container>
    </money-calculations>
  );

  function regularCompDataFields() {
    const compsTowardTheNextBigComp = getCompsTowardTheNextBigComp(comp, compHistory)
      .slice()
      .sort((compA, compB) => (compA.date < compB.date ? -1 : 1));
    const eachBigCompContribution = compsTowardTheNextBigComp.map(calculateCompBigCompContribution);
    const bigCompContributions = eachBigCompContribution.reduce(
      (accumulator, contribution) => accumulator + contribution,
      0,
    );
    const christmasContributionTotal = getChristmasContributionTotal(comp, compHistory);
    const numberOfCompsTowardChristmas = christmasContributionTotal / xmasCut;

    return (
      <>
        <field-group>
          <field-label>First Place Prize Money</field-label>
          <field-value>${firstPlacePrizeMoney}</field-value>
          <field-description>
            <description-line>
              Number of players ({numberOfPlayers}) ✖️ buyin (${buyIn}) 🟰 ${totalBuyIns}
            </description-line>
            <description-line>
              ✖️ first place percentage ({firstPlacePrizeMoneyPercentage * 100}%)
              🟰 ${totalBuyIns * firstPlacePrizeMoneyPercentage}
            </description-line>
            <description-line>
              ➕ bar input (${barInput}) 🟰 ${firstPlacePrizeMoney}
            </description-line>
          </field-description>
        </field-group>
        {moneyTowardsBigCompField()}
        <field-group>
          <field-label>Big Comp Contributions</field-label>
          <field-value>${bigCompContributions}</field-value>
          <field-description>
            <description-line>
              Big comp contribution (half the buyins ➖ christmas contribution)
              from each comp since the last 3rd Thursday, including this week
            </description-line>
            {compsTowardTheNextBigComp.map(bigCompContributionLine)}
            <description-line>
              {eachBigCompContribution.map((contribution) => `$${contribution}`).join(" ➕ ")}
              {" "}🟰 ${bigCompContributions}
            </description-line>
          </field-description>
        </field-group>
        {christmasContributionTotalField(christmasContributionTotal, numberOfCompsTowardChristmas)}
      </>
    );
  }

  function bigCompDataFields() {
    const totalBigCompPrizePool = getBigCompTotalPrizePool(comp, compHistory);
    const compsContributingToThisBigComp = getCompsFromThePreviousMonthsThirdThursday(comp, compHistory)
      .slice()
      .sort((compA, compB) => (compA.date < compB.date ? -1 : 1));
    const eachBigCompContribution = compsContributingToThisBigComp.map(
      calculateCompBigCompContribution,
    );
    const bigCompContributions = eachBigCompContribution.reduce(
      (accumulator, contribution) => accumulator + contribution,
      0,
    );
    const mainCompFirstPlacePrizeMoney = calculateBigCompFirstPrizeMoney(comp, compHistory);
    const mainCompSecondPlacePrizeMoney = calculateBigCompSecondPrizeMoney(comp, compHistory);
    const mainCompPrizePool = mainCompFirstPlacePrizeMoney + mainCompSecondPlacePrizeMoney;
    const secondChanceFirstPlacePrizeMoney = calculateSecondChanceFirstPrizeMoney(comp, compHistory);
    const christmasContributionTotal = getChristmasContributionTotal(comp, compHistory);
    const numberOfCompsTowardChristmas = christmasContributionTotal / xmasCut;

    return (
      <>
        <field-group>
          <field-label>Total Big Comp Prize Pool</field-label>
          <field-value>${totalBigCompPrizePool}</field-value>
          <field-description>
            <description-line>
              Big comp contributions (${bigCompContributions})
              ➕ half the buyins (${totalBuyIns * firstPlacePrizeMoneyPercentage})
              ➕ bar input (${barInput}) 🟰 ${totalBigCompPrizePool}
            </description-line>
          </field-description>
        </field-group>

        <field-group>
          <field-label>Big Comp Contributions</field-label>
          <field-value>${bigCompContributions}</field-value>
          <field-description>
            <description-line>
              Big comp contribution (half the buyins ➖ christmas contribution)
              from each comp since the previous month's 3rd Thursday
            </description-line>
            {compsContributingToThisBigComp.map(bigCompContributionLine)}
            <description-line>
              {eachBigCompContribution.map((contribution) => `$${contribution}`).join(" ➕ ")}
              {" "}🟰 ${bigCompContributions}
            </description-line>
          </field-description>
        </field-group>

        {moneyTowardsBigCompField("Money towards Next Big Comp")}
        {christmasContributionTotalField(christmasContributionTotal, numberOfCompsTowardChristmas)}

        <field-group>
          <field-label>Main Comp Prize Pool</field-label>
          <field-value>${mainCompPrizePool}</field-value>
          <field-description>
            <description-line>
              Total prize pool (${totalBigCompPrizePool}) ✖️ main comp percentage ({mainCompPercentage * 100}%)
              🟰 ${mainCompPrizePool}
            </description-line>
          </field-description>
        </field-group>

        <field-group>
          <field-label>Main Comp First Place</field-label>
          <field-value>${mainCompFirstPlacePrizeMoney}</field-value>
          <field-description>
            <description-line>
              Main prize pool (${mainCompPrizePool}) ✖️ first place percentage ({mainCompFirstPlacePercentage * 100}%)
              🟰 ${mainCompFirstPlacePrizeMoney}
            </description-line>
          </field-description>
        </field-group>

        <field-group>
          <field-label>Main Comp Second Place</field-label>
          <field-value>${mainCompSecondPlacePrizeMoney}</field-value>
          <field-description>
            <description-line>
              Main prize pool (${mainCompPrizePool}) ➖ first place (${mainCompFirstPlacePrizeMoney})
              🟰 ${mainCompSecondPlacePrizeMoney}
            </description-line>
          </field-description>
        </field-group>

        <field-group>
          <field-label>2nd Chance First Place</field-label>
          <field-value>${secondChanceFirstPlacePrizeMoney}</field-value>
          <field-description>
            <description-line>
              Total prize pool (${totalBigCompPrizePool}) ➖ main prize pool (${mainCompPrizePool})
              🟰 ${secondChanceFirstPlacePrizeMoney}
            </description-line>
          </field-description>
        </field-group>
      </>
    );
  }

  function christmasContributionTotalField(
    christmasContributionTotal: number,
    numberOfCompsTowardChristmas: number,
  ) {
    return (
      <field-group>
        <field-label>Christmas Contribution Total</field-label>
        <field-value>${christmasContributionTotal}</field-value>
        <field-description>
          <description-line>
            Comps so far ({numberOfCompsTowardChristmas}) ✖️ christmas contribution (${xmasCut})
            🟰 ${christmasContributionTotal}
          </description-line>
        </field-description>
      </field-group>
    );
  }

  function moneyTowardsBigCompField(label = "Money towards Big Comp") {
    return (
      <field-group>
        <field-label>{label}</field-label>
        <field-value>${bigCompContribution}</field-value>
        <field-description>
          <description-line>
            Number of players ({numberOfPlayers}) ✖️ buyin (${buyIn}) 🟰 ${totalBuyIns}
          </description-line>
          <description-line>
            ✖️ big comp contribution percentage ({contributionPercentage * 100}%)
            🟰 ${totalBuyIns * contributionPercentage}
          </description-line>
          <description-line>
            ➖ christmas contribution (${xmasCut}) 🟰 ${bigCompContribution}
          </description-line>
        </field-description>
      </field-group>
    );
  }

  function bigCompContributionLine(contributingComp: PoolComp) {
    const contributingCompIsABigComp = dateIsTheThirdThursdayOfTheMonth(contributingComp.date);

    return (
      <description-line key={contributingComp.id}>
        {formatCompDate(contributingComp.date)}{contributingCompIsABigComp ? " (big comp)" : ""}
        : players ({contributingComp.registeredPlayers.length})
        🟰 ${calculateCompBigCompContribution(contributingComp)}
      </description-line>
    );
  }
}

function formatCompDate(date: string): string {
  return format(parseISO(date), "d MMM", { locale: enAU });
}
