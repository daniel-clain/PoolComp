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
    <image id={id}>
      <img src={src} className={className} />
    </image>
  );
}
