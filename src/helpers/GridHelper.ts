// src/helpers/GridHelper.ts

export const switchColor = (
    isOnState: boolean,
    forSale: boolean,
    owner: string,
    userAccount: string | null | undefined
  ): number => {
    if (isOnState) {
      if (forSale) {
        return userAccount && userAccount === owner ? 3 : 7;
      } else {
        return userAccount && userAccount === owner ? 2 : 6;
      }
    } else {
      if (forSale) {
        return userAccount && userAccount === owner ? 1 : 5;
      } else {
        return userAccount && userAccount === owner ? 0 : 4;
      }
    }
  };
  