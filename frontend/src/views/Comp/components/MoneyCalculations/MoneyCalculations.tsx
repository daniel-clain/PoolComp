import { poolCompConfig } from "../../../../../../shared/poolCompConfig";
import { useAppContext } from "../../../../AppContext";
import { calculateBigCompMoney, calculateFirstPrizeMoney } from "../../../../services/poolComp.service";

export function MoneyCalculations() {

  const { activePoolComp } = useAppContext()
  const { buyIn, bigComp } = poolCompConfig
  const { contributionPercentage } = bigComp

  const firstPlacePrizeMoneyPercentage = 1 - contributionPercentage
  const numberOfPlayers = activePoolComp!.registeredPlayers.length

  const firstPlacePrizeMoney = calculateFirstPrizeMoney(activePoolComp!.registeredPlayers)
  const bigCompMoney = calculateBigCompMoney(activePoolComp!.registeredPlayers)
  return (
    <money-calculations className="panel-container">
      <panel-heading>Money Calculations</panel-heading>

      <comp-data-container>
        <comp-data-heading>Comp Data</comp-data-heading>
        <data-group>
          <data-label>First Place Prize Money</data-label>
          <data-value>${firstPlacePrizeMoney}</data-value>
          <data-description>
            <description-line>Number of players ({numberOfPlayers}) ✖️ buyin (${buyIn})  🟰 ${numberOfPlayers * buyIn}</description-line>
            <description-line>✖️ big comp contribution percentage ({firstPlacePrizeMoneyPercentage * 100}%) 🟰 ${numberOfPlayers * buyIn * firstPlacePrizeMoneyPercentage}</description-line>
            <description-line> ➕ bar input (${poolCompConfig.barInput}) 🟰 ${firstPlacePrizeMoney}</description-line></data-description>
        </data-group>
        <data-group>
          <data-label>Money towards Big Comp</data-label>
          <data-value>${bigCompMoney}</data-value>
          <data-description>
            <description-line>Number of players ({numberOfPlayers}) ✖️ buyin (${buyIn})  🟰 ${numberOfPlayers * buyIn}</description-line>
            <description-line>✖️ big comp contribution percentage ({contributionPercentage * 100}%) 🟰 ${numberOfPlayers * buyIn * contributionPercentage}</description-line>
            <description-line> ➖ christmas contribution (${poolCompConfig.xmasCut}) 🟰 ${bigCompMoney}</description-line></data-description>
        </data-group>
      </comp-data-container>

      <base-values-container>
        <comp-data-heading>Base Values</comp-data-heading>
        <data-group>
          <data-label>Buyin per player</data-label>
          <data-value>${buyIn}</data-value>
        </data-group>
        <data-group>
          <data-label>First place prize money percentage</data-label>
          <data-value>{firstPlacePrizeMoneyPercentage * 100}%</data-value>
        </data-group>
        <data-group>
          <data-label>Big comp contribution percentage</data-label>
          <data-value>{contributionPercentage * 100}%</data-value>
        </data-group>

        <data-group>
          <data-label>Christmas Contribution</data-label>
          <data-value>${poolCompConfig.xmasCut}</data-value>
        </data-group></base-values-container>
    </money-calculations>
  )
}