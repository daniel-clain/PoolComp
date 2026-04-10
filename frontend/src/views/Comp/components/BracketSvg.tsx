type BracketPoint = { x: number; y: number }

function nextPowerOfTwo(value: number): number {
  let result = 1
  while (result < value) {
    result *= 2
  }
  return result
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function buildBracketData(playerNames: string[]) {
  const bracketSize = clamp(nextPowerOfTwo(Math.max(playerNames.length, 2)), 8, 32)
  const rounds = Math.log2(bracketSize) + 1
  const t = (bracketSize - 8) / 24
  const boxWidth = 86 - t * 20
  const boxHeight = 34 - t * 12
  const gapY = 14 - t * 8
  const columnGap = 40 - t * 14
  const pitch = boxHeight + gapY

  const roundCenters: BracketPoint[][] = []
  roundCenters[0] = Array.from({ length: bracketSize }, (_, index) => ({
    x: 0,
    y: index * pitch + boxHeight / 2,
  }))

  for (let roundIndex = 1; roundIndex < rounds; roundIndex += 1) {
    const prev = roundCenters[roundIndex - 1]
    const current: BracketPoint[] = []
    for (let i = 0; i < prev.length; i += 2) {
      current.push({
        x: roundIndex * (boxWidth + columnGap),
        y: (prev[i].y + prev[i + 1].y) / 2,
      })
    }
    roundCenters[roundIndex] = current
  }

  const labels = Array.from({ length: bracketSize }, (_, index) => playerNames[index] ?? '')
  const pad = 4
  const svgWidth = rounds * boxWidth + (rounds - 1) * columnGap + pad * 2
  const svgHeight = bracketSize * boxHeight + (bracketSize - 1) * gapY + pad * 2

  return { boxWidth, boxHeight, columnGap, roundCenters, labels, svgWidth, svgHeight, pad }
}

export function BracketSvg({ playerNames }: { playerNames: string[] }) {
  const data = buildBracketData(playerNames)
  const { pad } = data

  return (
    <svg
      preserveAspectRatio="xMidYMid meet"
      viewBox={`${-pad} ${-pad} ${data.svgWidth} ${data.svgHeight}`}
    >
      <g>
        {data.roundCenters.slice(0, -1).map((round, roundIndex) =>
          round.map((childPoint, childIndex) => {
            const parentPoint = data.roundCenters[roundIndex + 1][Math.floor(childIndex / 2)]
            const x1 = childPoint.x + data.boxWidth
            const y1 = childPoint.y
            const xMid = x1 + data.columnGap / 2
            const x2 = parentPoint.x
            const y2 = parentPoint.y
            return (
              <path
                d={`M ${x1} ${y1} H ${xMid} V ${y2} H ${x2}`}
                fill="none"
                key={`l-${roundIndex}-${childIndex}`}
                stroke="#2a2a2a"
                strokeLinecap="square"
                strokeWidth={1.8}
              />
            )
          }),
        )}
      </g>

      {data.roundCenters.map((round, roundIndex) =>
        round.map((point, index) => (
          <g key={`n-${roundIndex}-${index}`}>
            <rect
              fill="#ffffff"
              height={data.boxHeight}
              rx={2}
              ry={2}
              stroke="#252525"
              strokeWidth={1.8}
              width={data.boxWidth}
              x={point.x}
              y={point.y - data.boxHeight / 2}
            />
            {roundIndex === 0 ? (
              <text dominantBaseline="middle" fill="#1f1f1f" fontSize={10} x={point.x + 6} y={point.y + 4}>
                {data.labels[index]}
              </text>
            ) : null}
          </g>
        )),
      )}
    </svg>
  )
}
