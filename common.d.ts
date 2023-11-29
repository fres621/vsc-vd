type snipe = (funcName: string, funcParent: any, oneTime?: boolean) => () => void;
type shotgun = (object: any, oneTime?: boolean) => ()=>void;
declare const dk: {
  snipe: snipe;
  shotgun: shotgun;
  wipe: () => void;
  findByKeyword: (keyword: string) => symbol;
  findByKeywordAll: (keyword: string) => symbol[];
};
declare const findByKeywordAll: (keyword: string) => symbol[];
declare const findByKeyword: (keyword: string) => symbol;