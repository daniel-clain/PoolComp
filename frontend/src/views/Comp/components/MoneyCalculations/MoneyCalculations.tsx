import { poolCompConfig } from "../../../../../../shared/poolCompConfig";
import { useAppContext } from "../../../../AppContext";
import {
  calculateBigCompFirstPrizeMoney,
  calculateBigCompSecondPrizeMoney,
  calculateCompBigCompContribution,
  calculateSecondChanceFirstPrizeMoney,
  getBigCompTotalPrizePool,
} from "../../../../services/bigComp.service";
import { calculateFirstPrizeMoney } from "../../../../services/poolComp.service";

export function MoneyCalculations() {
  const { activePoolComp, activeHistoricalComp, compHistory } = useAppContext();
  const comp = activeHistoricalComp ?? activePoolComp!;
  const isBigComp = Boolean(comp.secondChanceSlots?.length);

  const { buyIn, bigComp, barInput, xmasCut } = poolCompConfig;
  const { contributionPercentage, mainCompPercentage, mainCompFirstPlacePercentage } = bigComp;

  const numberOfPlayers = comp.registeredPlayers.length;
  const totalBuyIns = numberOfPlayers * buyIn;

  if (isBigComp) {
    const thisWeekNormalFirstPlacePrizeMoney = calculateFirstPrizeMoney(comp);
    const totalBigCompPrizePool = getBigCompTotalPrizePool(comp, compHistory);
    const bigCompFundFromPreviousComps = totalBigCompPrizePool - thisWeekNormalFirstPlacePrizeMoney;
    const mainCompFirstPlacePrizeMoney = calculateBigCompFirstPrizeMoney(comp, compHistory);
    const mainCompSecondPlacePrizeMoney = calculateBigCompSecondPrizeMoney(comp, compHistory);
    const mainCompPrizePool = mainCompFirstPlacePrizeMoney + mainCompSecondPlacePrizeMoney;
    const secondChanceFirstPlacePrizeMoney = calculateSecondChanceFirstPrizeMoney(comp, compHistory)!;
    const firstPlacePrizeMoneyPercentage = 1 - contributionPercentage;

    return (
      <money-calculations className="panel-container">
        <panel-heading>Money Calculations</panel-heading>

        <fields-container>
          <comp-data-heading>Comp Data</comp-data-heading>

          <field-group>
            <field-label>Total Big Comp Prize Pool</field-label>
            <field-value>${totalBigCompPrizePool}</field-value>
            <field-description>
              <description-line>
                Fund from previous comps 🟰 ${bigCompFundFromPreviousComps}
              </description-line>
              <description-line>
                ➕ this week's normal first place prize (${thisWeekNormalFirstPlacePrizeMoney}) 🟰 ${totalBigCompPrizePool}
              </description-line>
              <description-line>
                This week's normal first place: players ({numberOfPlayers}) ✖️ buyin (${buyIn}) 🟰 ${totalBuyIns}
              </description-line>
              <description-line>
                ✖️ first place percentage ({firstPlacePrizeMoneyPercentage * 100}%) 🟰 ${totalBuyIns * firstPlacePrizeMoneyPercentage}
              </description-line>
              <description-line>
                ➕ bar input (${barInput}) 🟰 ${thisWeekNormalFirstPlacePrizeMoney}
              </description-line>
            </field-description>
          </field-group>

          <field-group>
            <field-label>Main Comp Prize Pool</field-label>
            <field-value>${mainCompPrizePool}</field-value>
            <field-description>
              <description-line>
                Total prize pool (${totalBigCompPrizePool}) ✖️ main comp percentage ({mainCompPercentage * 100}%) 🟰 ${mainCompPrizePool}
              </description-line>
            </field-description>
          </field-group>

          <field-group>
            <field-label>Main Comp First Place</field-label>
            <field-value>${mainCompFirstPlacePrizeMoney}</field-value>
            <field-description>
              <description-line>
                Main prize pool (${mainCompPrizePool}) ✖️ first place percentage ({mainCompFirstPlacePercentage * 100}%) 🟰 ${mainCompFirstPlacePrizeMoney}
              </description-line>
            </field-description>
          </field-group>

          <field-group>
            <field-label>Main Comp Second Place</field-label>
            <field-value>${mainCompSecondPlacePrizeMoney}</field-value>
            <field-description>
              <description-line>
                Main prize pool (${mainCompPrizePool}) ➖ first place (${mainCompFirstPlacePrizeMoney}) 🟰 ${mainCompSecondPlacePrizeMoney}
              </description-line>
            </field-description>
          </field-group>

          <field-group>
            <field-label>2nd Chance First Place</field-label>
            <field-value>${secondChanceFirstPlacePrizeMoney}</field-value>
            <field-description>
              <description-line>
                Total prize pool (${totalBigCompPrizePool}) ➖ main prize pool (${mainCompPrizePool}) 🟰 ${secondChanceFirstPlacePrizeMoney}
              </description-line>
            </field-description>
          </field-group>
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
            <field-label>Main comp percentage</field-label>
            <field-value>{mainCompPercentage * 100}%</field-value>
          </field-group>
          <field-group>
            <field-label>Main comp first place percentage</field-label>
            <field-value>{mainCompFirstPlacePercentage * 100}%</field-value>
          </field-group>
          <field-group>
            <field-label>Big comp contribution percentage</field-label>
            <field-value>{contributionPercentage * 100}%</field-value>
          </field-group>
        </fields-container>
      </money-calculations>
    );
  }

  const firstPlacePrizeMoneyPercentage = 1 - contributionPercentage;
  const firstPlacePrizeMoney = calculateFirstPrizeMoney(comp);
  const bigCompMoney = calculateCompBigCompContribution(comp);

  return (
    <money-calculations className="panel-container">
      <panel-heading>Money Calculations</panel-heading>

      <fields-container>
        <comp-data-heading>Comp Data</comp-data-heading>
        <field-group>
          <field-label>First Place Prize Money</field-label>
          <field-value>${firstPlacePrizeMoney}</field-value>
          <field-description>
            <description-line>Number of players ({numberOfPlayers}) ✖️ buyin (${buyIn})  🟰 ${totalBuyIns}</description-line>
            <description-line>✖️ big comp contribution percentage ({firstPlacePrizeMoneyPercentage * 100}%) 🟰 ${totalBuyIns * firstPlacePrizeMoneyPercentage}</description-line>
            <description-line> ➕ bar input (${barInput}) 🟰 ${firstPlacePrizeMoney}</description-line>
          </field-description>
        </field-group>
        <field-group>
          <field-label>Money towards Big Comp</field-label>
          <field-value>${bigCompMoney}</field-value>
          <field-description>
            <description-line>Number of players ({numberOfPlayers}) ✖️ buyin (${buyIn})  🟰 ${totalBuyIns}</description-line>
            <description-line>✖️ big comp contribution percentage ({contributionPercentage * 100}%) 🟰 ${totalBuyIns * contributionPercentage}</description-line>
            <description-line> ➖ christmas contribution (${xmasCut}) 🟰 ${bigCompMoney}</description-line>
          </field-description>
        </field-group>
      </fields-container>

      <fields-container>
        <comp-data-heading>Base Values</comp-data-heading>
        <field-group>
          <field-label>Buyin per player</field-label>
          <field-value>${buyIn}</field-value>
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
          <field-label>Christmas Contribution</field-label>
          <field-value>${xmasCut}</field-value>
        </field-group>
      </fields-container>
    </money-calculations>
  );
}
