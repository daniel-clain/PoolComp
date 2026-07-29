export function Connector({ connector }: { connector: { path: string } }) {
  return <path d={connector.path} key={connector.path} />;
}
