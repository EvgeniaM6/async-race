export interface IWinner {
  id: number;
  wins: number;
  time: number;
}

export interface IWinners {
  total: number;
  winnersArr: IWinner[];
}
