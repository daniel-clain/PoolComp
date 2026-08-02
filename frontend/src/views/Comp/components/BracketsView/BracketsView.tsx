import { useMemo } from "react";
import { useAppContext } from "../../../../AppContext";
import crownImage from "../../../../assets/crown.png";
import diningVoucherImage from "../../../../assets/dining-voucher.jpg";
import { ScalingImage } from "../../../../components/ScalingImage/ScalingImage";
import { calculateBigCompFirstPrizeMoney, calculateBigCompSecondPrizeMoney, calculateSecondChanceFirstPrizeMoney } from "../../../../services/bigComp.service";
import { calculateFirstPrizeMoney } from "../../../../services/poolComp.service";
import { TournamentStructure } from "./components/TournamentStructure/TournamentStructure";


export function BracketsView() {
  const {
    activePoolComp,
    activeHistoricalComp,
    orientation,
    compActiveTab,
    compHistory
  } = useAppContext();


  const comp = activeHistoricalComp ?? activePoolComp!;
  const isBigComp = comp.secondChanceSlots

  const slots = compActiveTab === "Main Comp" ? comp.slots : comp.secondChanceSlots!;

  const tournamentStructure = useMemo(() => {
    return <TournamentStructure />
  }, [slots, compActiveTab]);

  const textBoxes = useMemo(() => {
    {

      const { firstPrizeElem, secondPrizeElem } = getFirstAndSecondPrizeElems()!

      return (
        <text-box-container>
          <text-box>
            <text-box-label>
              <ScalingImage id="crown-image" src={crownImage} />
            </text-box-label>
            {firstPrizeElem}
          </text-box>
          <text-box>
            <text-box-label>SECOND PRIZE</text-box-label>
            {secondPrizeElem}
          </text-box>
        </text-box-container>
      );

      function getFirstAndSecondPrizeElems() {
        const twoDiningVouchersElem = <text-box-images>
          <ScalingImage
            id="second-prize-voucher-back"
            src={diningVoucherImage}
            className="second-prize-voucher-image"
          />
          <ScalingImage
            id="second-prize-voucher-front"
            src={diningVoucherImage}
            className="second-prize-voucher-image"
          />
        </text-box-images>

        if (compActiveTab === "Main Comp") {
          if (!isBigComp) {
            return {
              firstPrizeElem: (
                <text-box-value>
                  ${calculateFirstPrizeMoney(comp)}
                </text-box-value>
              ),
              secondPrizeElem: twoDiningVouchersElem
            }
          }

          if (isBigComp) {
            return {
              firstPrizeElem: (
                <text-box-value>
                  ${calculateBigCompFirstPrizeMoney(comp, compHistory)}
                </text-box-value>
              ),
              secondPrizeElem: (
                <text-box-value>
                  ${calculateBigCompSecondPrizeMoney(comp, compHistory)}
                </text-box-value>
              )
            }
          }

        }
        if (compActiveTab === "2nd Chance Comp") {
          return {
            firstPrizeElem: (
              <text-box-value>
                ${calculateSecondChanceFirstPrizeMoney(comp, compHistory)}
              </text-box-value>
            ),
            secondPrizeElem: twoDiningVouchersElem
          }
        }
        return {
          firstPrizeElem: <text-box-value>N/A</text-box-value>,
          secondPrizeElem: <text-box-value>N/A</text-box-value>
        }
      }

    }
  }, [comp, compActiveTab]);

  return <brackets-view>

    {orientation === "portrait" ? (
      <>
        {textBoxes}
        {tournamentStructure}
      </>
    ) : orientation === "landscape" ? (
      <>
        <left-container>
          {tournamentStructure}
        </left-container>
        <right-container>
          {textBoxes}
        </right-container>
      </>
    ) : null}
  </brackets-view>;
}