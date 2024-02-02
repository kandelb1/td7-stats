// given a number 1-8, adds the correct suffix for ranks
// ie. formatRank(1) -> '1st'
export function formatRank(rank: number): string {
  switch(rank){
    case 1:
      return '1st';
    case 2:
      return '2nd'
    case 3:
      return '3rd'
  }
  return `${rank}th`; // 4-8 is all the same
}