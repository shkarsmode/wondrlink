export interface IFlowSelect {
  id: string;
  title: string;
  subtitle: string;
  subgroup: Subgroup[]
}

interface Subgroup {
  title: string;
  subtitle?: string;
  icon: string;
  function?: string[];
}
