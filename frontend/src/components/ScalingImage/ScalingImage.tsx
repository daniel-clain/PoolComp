export function ScalingImage({
  id,
  src,
  className,
}: {
  id: string;
  src: string;
  className?: string;
}) {
  return (
    <scaling-image id={id} className={className}>
      <img src={src} />
    </scaling-image>
  );
}
