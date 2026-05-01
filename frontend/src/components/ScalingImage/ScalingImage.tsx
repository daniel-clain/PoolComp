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
    <scaling-image id={id}>
      <img src={src} className={className} />
    </scaling-image>
  );
}
