import { poolCompConfig } from "../../../../../../shared/poolCompConfig";
import { useAppContext } from "../../../../AppContext";
import { calculateCompBigCompContribution } from "../../../../services/bigComp.service";
import { calculateFirstPrizeMoney } from "../../../../services/poolComp.service";

export function MoneyCalculations() {

  const { activePoolComp } = useAppContext()
  const { buyIn, bigComp } = poolCompConfig
  const { contributionPercentage } = bigComp

  const firstPlacePrizeMoneyPercentage = 1 - contributionPercentage
  const numberOfPlayers = activePoolComp!.registeredPlayers.length

  const firstPlacePrizeMoney = calculateFirstPrizeMoney(activePoolComp!)
  const bigCompMoney = calculateCompBigCompContribution(activePoolComp!)
  return (
    <money-calculations className="panel-container">
      <panel-heading>Money Calculations</panel-heading>

      <fields-container>
        <comp-data-heading>Comp Data</comp-data-heading>
        <field-group>
          <field-label>First Place Prize Money</field-label>
          <field-value>${firstPlacePrizeMoney}</field-value>
          <field-description>
            <description-line>Number of players ({numberOfPlayers}) ✖️ buyin (${buyIn})  🟰 ${numberOfPlayers * buyIn}</description-line>
            <description-line>✖️ big comp contribution percentage ({firstPlacePrizeMoneyPercentage * 100}%) 🟰 ${numberOfPlayers * buyIn * firstPlacePrizeMoneyPercentage}</description-line>
            <description-line> ➕ bar input (${poolCompConfig.barInput}) 🟰 ${firstPlacePrizeMoney}</description-line></field-description>
        </field-group>
        <field-group>
          <field-label>Money towards Big Comp</field-label>
          <field-value>${bigCompMoney}</field-value>
          <field-description>
            <description-line>Number of players ({numberOfPlayers}) ✖️ buyin (${buyIn})  🟰 ${numberOfPlayers * buyIn}</description-line>
            <description-line>✖️ big comp contribution percentage ({contributionPercentage * 100}%) 🟰 ${numberOfPlayers * buyIn * contributionPercentage}</description-line>
            <description-line> ➖ christmas contribution (${poolCompConfig.xmasCut}) 🟰 ${bigCompMoney}</description-line></field-description>
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
          <field-value>${poolCompConfig.xmasCut}</field-value>
        </field-group></fields-container>
    </money-calculations>
  )
}