type BracketPoint = { x: number; y: number };

const XHTML_NS = "http://www.w3.org/1999/xhtml";

function nextPowerOfTwo(value: number): number {
  let result = 1;
  while (result < value) {
    result *= 2;
  }
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function bracketNameFontSizePx(boxHeight: number): number {
  const verticalReserve = 6;
  return Math.round(Math.min(16, Math.max(12, boxHeight - verticalReserve)));
}

function buildBracketData(firstRoundLabels: string[]) {
  const bracketSize = clamp(
    nextPowerOfTwo(Math.max(firstRoundLabels.length, 2)),
    8,
    32,
  );
  const rounds = Math.log2(bracketSize) + 1;
  const t = (bracketSize - 8) / 24;
  const boxWidth = 86 - t * 20;
  const boxHeight = 34 - t * 12;
  const gapY = 14 - t * 8;
  const columnGap = 40 - t * 14;
  const pitch = boxHeight + gapY;

  const roundCenters: BracketPoint[][] = [];
  roundCenters[0] = Array.from({ length: bracketSize }, (_, index) => ({
    x: 0,
    y: index * pitch + boxHeight / 2,
  }));

  for (let roundIndex = 1; roundIndex < rounds; roundIndex += 1) {
    const prev = roundCenters[roundIndex - 1];
    const current: BracketPoint[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      current.push({
        x: roundIndex * (boxWidth + columnGap),
        y: (prev[i].y + prev[i + 1].y) / 2,
      });
    }
    roundCenters[roundIndex] = current;
  }

  const labels = Array.from(
    { length: bracketSize },
    (_, index) => firstRoundLabels[index] ?? "",
  );
  const pad = 4;
  const svgWidth = rounds * boxWidth + (rounds - 1) * columnGap + pad * 2;
  const svgHeight =
    bracketSize * boxHeight + (bracketSize - 1) * gapY + pad * 2;

  return {
    boxWidth,
    boxHeight,
    columnGap,
    roundCenters,
    labels,
    svgWidth,
    svgHeight,
    pad,
  };
}

export function BracketSvg({
  firstRoundLabels,
  started,
}: {
  firstRoundLabels: string[];
  started: boolean;
}) {
  const data = buildBracketData(firstRoundLabels);
  const { pad } = data;
  const nameFontPx = bracketNameFontSizePx(data.boxHeight);

  return (
    <svg
      className="bracket-svg"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`${-pad} ${-pad} ${data.svgWidth} ${data.svgHeight}`}
    >
      <g>
        {data.roundCenters.slice(0, -1).map((round, roundIndex) =>
          round.map((childPoint, childIndex) => {
            const parentPoint =
              data.roundCenters[roundIndex + 1][Math.floor(childIndex / 2)];
            const x1 = childPoint.x + data.boxWidth;
            const y1 = childPoint.y;
            const xMid = x1 + data.columnGap / 2;
            const x2 = parentPoint.x;
            const y2 = parentPoint.y;
            return (
              <path
                d={`M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`}
                fill="none"
                key={`l-${roundIndex}-${childIndex}`}
                stroke="var(--bracket-connector)"
                strokeLinecap="square"
                strokeWidth={1.8}
              />
            );
          }),
        )}
      </g>

      {data.roundCenters.map((round, roundIndex) =>
        round.map((point, index) => (
          <g key={`n-${roundIndex}-${index}`}>
            <rect
              fill="var(--bracket-slot-fill)"
              height={data.boxHeight}
              rx={2}
              ry={2}
              stroke="var(--bracket-slot-border)"
              strokeWidth={1.8}
              width={data.boxWidth}
              x={point.x}
              y={point.y - data.boxHeight / 2}
            />
            {roundIndex === 0 ? (
              <foreignObject
                height={data.boxHeight}
                width={data.boxWidth}
                x={point.x}
                y={point.y - data.boxHeight / 2}
              >
                <div
                  className={
                    started && data.labels[index].trim() === ""
                      ? "bracket-name-slot is-bye"
                      : "bracket-name-slot"
                  }
                  style={{ fontSize: `${nameFontPx}px` }}
                  // XHTML namespace for content inside SVG foreignObject
                  {...{ xmlns: XHTML_NS }}
                >
                  <span className="bracket-name-slot-text">
                    {started && data.labels[index].trim() === ""
                      ? "BYE"
                      : data.labels[index]}
                  </span>
                </div>
              </foreignObject>
            ) : null}
          </g>
        )),
      )}
    </svg>
  );
}
