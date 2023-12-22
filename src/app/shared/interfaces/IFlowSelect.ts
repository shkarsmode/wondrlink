export interface IFlowSelect {
  id: string;
  title: string;
  subtitle: string;
  list: List[]
}

interface List {
  title: string;
  subtitle?: string;
  icon: string;
  position?: string[];
}
